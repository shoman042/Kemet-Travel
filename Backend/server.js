const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OpenAI = require('openai');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const PORT = Number(process.env.PORT || 5000);
const APP_VERSION = Date.now();

const cleanEnv = (value) => String(value || '').trim();
const resolveOpenRouterKey = () => {
  const primary = cleanEnv(process.env.OPENROUTER_API_KEY);
  const fallback = cleanEnv(process.env.OPENAI_API_KEY);
  if (primary) return primary;
  if (fallback.startsWith('sk-or-')) return fallback;
  return '';
};

// ?????? ?? ???? ??????? ?????? ???? ???????
const bootKey = resolveOpenRouterKey();
if (!bootKey) {
  console.error('CRITICAL ERROR: OPENROUTER_API_KEY is missing (or OPENAI_API_KEY is not an sk-or key).');
} else {
  console.log('AI Key detected: ' + bootKey.substring(0, 10) + '...');
}

const Trip = require('./models/Trip');
const Trips = require('./models/Trips');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Hotel = require('./models/Hotel');
const Place = require('./models/Place');
const ChatHistory = require('./models/ChatHistory');


const app = express();
const frontendDir = path.join(__dirname, '..', 'Fronted');

// ✅ Rate Limiting — يمنع brute force على اللوجين
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5,
  message: { message: 'كتير أوي محاولات، استنى 15 دقيقة وحاول تاني' },
  standardHeaders: true,
  legacyHeaders: false,
});
const OPENROUTER_BASE_URL = cleanEnv(process.env.OPENROUTER_BASE_URL) || 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = resolveOpenRouterKey();
const OPENROUTER_MODEL =
  cleanEnv(process.env.OPENROUTER_MODEL) ||
  cleanEnv(process.env.OPENAI_MODEL) ||
  'google/gemini-2.0-flash-lite-preview-02-05:free';
const APP_REFERER = cleanEnv(process.env.APP_REFERER) || `http://localhost:${PORT}`;
const APP_TITLE = cleanEnv(process.env.APP_TITLE) || 'Kemet Travel App';
const CORS_ORIGINS = cleanEnv(process.env.CORS_ORIGIN)
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);
const SMTP_SERVICE = cleanEnv(process.env.SMTP_SERVICE);
const SMTP_HOST = cleanEnv(process.env.SMTP_HOST);
const SMTP_PORT = Number(cleanEnv(process.env.SMTP_PORT) || 587);
const SMTP_SECURE = String(cleanEnv(process.env.SMTP_SECURE) || 'false').toLowerCase() === 'true';
const SMTP_USER = cleanEnv(process.env.SMTP_USER);
const SMTP_PASS = cleanEnv(process.env.SMTP_PASS);
const SMTP_FROM = cleanEnv(process.env.SMTP_FROM) || SMTP_USER;

const openai = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: OPENROUTER_BASE_URL,
  defaultHeaders: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': APP_REFERER,
    'X-Title': APP_TITLE,
  },
});

let mailTransporter = null;
const getMailTransporter = () => {
  if (mailTransporter) return mailTransporter;
  const hasServiceConfig = Boolean(SMTP_SERVICE && SMTP_USER && SMTP_PASS && SMTP_FROM);
  const hasHostConfig = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM);
  if (!hasServiceConfig && !hasHostConfig) {
    return null;
  }
  mailTransporter = nodemailer.createTransport({
    ...(SMTP_SERVICE ? { service: SMTP_SERVICE } : { host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_SECURE }),
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return mailTransporter;
};

app.use(
  cors({
    origin: CORS_ORIGINS.length ? CORS_ORIGINS : true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  })
);
app.use(express.json());
app.use((req, res, next) => {
  // Force revalidation on every request for static assets/pages
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const injectAssetVersion = (html) => {
  const version = String(APP_VERSION);
  return String(html || '').replace(
    /(href|src)=["']([^"']+\.(?:css|js)(?:\?[^"']*)?)["']/gi,
    (full, attr, assetPath) => {
      const value = String(assetPath || '');
      if (/^(?:https?:)?\/\//i.test(value) || /^data:/i.test(value)) return full;
      const separator = value.includes('?') ? '&' : '?';
      return `${attr}="${value}${separator}v=${version}"`;
    }
  );
};

const sendVersionedHtml = async (req, res, next) => {
  try {
    const requestPath = req.path === '/' ? '/index.html' : req.path;
    if (!requestPath.endsWith('.html')) return next();

    const safeRelative = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(frontendDir, safeRelative);

    if (!filePath.startsWith(frontendDir)) {
      return res.status(400).send('Invalid path');
    }

    if (!fs.existsSync(filePath)) return next();
    const html = await fs.promises.readFile(filePath, 'utf8');
    return res.type('html').send(injectAssetVersion(html));
  } catch (err) {
    return next(err);
  }
};

app.get('/', sendVersionedHtml);
app.get(/.*\.html$/, sendVersionedHtml);
app.use(
  express.static(frontendDir, {
    etag: true,
    lastModified: true,
    maxAge: 0,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    },
  })
);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected successfully to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Middleware: wait for MongoDB before processing requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  console.log(`[DB Wait] ${req.method} ${req.path} - readyState: ${mongoose.connection.readyState}`);
  // Wait for connection to be ready
  mongoose.connection.asPromise()
    .then(() => {
      console.log(`[DB Wait] Connection ready, proceeding`);
      next();
    })
    .catch((err) => {
      console.error('DB connection failed:', err.message);
      res.status(503).json({ message: 'Database unavailable. Please try again.' });
    });
});

const PLACE_DEFAULT_IMAGES = {
  karnak: [
    'https://images.unsplash.com/photo-1590274853856-f22d5ee3d228',
    'https://images.unsplash.com/photo-1599572502390-3486000210e7',
    'https://images.unsplash.com/photo-1623816694665-2a2b0e6e7368',
  ],
  rasMohammed: [
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
    'https://images.unsplash.com/photo-1518391846015-55a9cc003b25',
    'https://images.unsplash.com/photo-1629813293809-f641215bb41f',
  ],
  genericEgypt: [
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f34',
    'https://images.unsplash.com/photo-1572252009286-268acec5ca0a',
    'https://images.unsplash.com/photo-1566192091743-5966a6079984',
  ],
};

const normalizeUnsplashImage = (url) => {
  const value = String(url || '').trim();
  if (!value) return '';
  if (/images\.unsplash\.com/i.test(value)) {
    return `${value}${value.includes('?') ? '&' : '?'}auto=format&fit=crop&w=1600&q=80`;
  }
  return value;
};

const getDefaultPlaceImages = (name) => {
  const normalizedName = String(name || '').toLowerCase();
  if (normalizedName.includes('karnak')) return PLACE_DEFAULT_IMAGES.karnak;
  if (normalizedName.includes('ras mohammed')) return PLACE_DEFAULT_IMAGES.rasMohammed;
  return PLACE_DEFAULT_IMAGES.genericEgypt;
};

const enrichPlaceForResponse = (placeInput) => {
  const place = placeInput && typeof placeInput.toObject === 'function' ? placeInput.toObject() : { ...(placeInput || {}) };
  const existingImages = Array.isArray(place.images) ? place.images.filter(Boolean) : [];
  const defaultImages = getDefaultPlaceImages(place.name);
  const mergedImages = [...existingImages, ...defaultImages, ...PLACE_DEFAULT_IMAGES.genericEgypt]
    .map(normalizeUnsplashImage)
    .filter(Boolean)
    .filter((img, idx, arr) => arr.indexOf(img) === idx)
    .slice(0, 3);

  return {
    ...place,
    images: mergedImages.length ? mergedImages : PLACE_DEFAULT_IMAGES.genericEgypt.map(normalizeUnsplashImage).slice(0, 3),
    openingHours: place.openingHours || 'Contact us for info',
    highlights: Array.isArray(place.highlights) && place.highlights.length ? place.highlights : ['Contact us for info'],
    entryFee: Number.isFinite(Number(place.entryFee)) ? Number(place.entryFee) : null,
  };
};

const detectReplyStyle = (message, history = []) => {
  const sample = [String(message || ''), ...history.map((h) => String(h?.content || ''))].join(' ');
  const hasArabic = /[\u0600-\u06FF]/.test(sample);
  if (hasArabic) {
    return '????? ??????? ??????? ??????? ???? ???? ?????.';
  }
  return 'Reply in the same language as the user, with a professional and friendly travel-consultant tone.';
};

const buildOfflineReply = (message, tripsContext = [], placesContext = []) => {
  const text = String(message || '').trim();
  const isArabic = /[\u0600-\u06FF]/.test(text);
  const budgetMatch = text.match(/\d[\d,]*/);
  const budget = budgetMatch ? Number(String(budgetMatch[0]).replace(/,/g, '')) : null;
  const topTrips = tripsContext.slice(0, 3).map((t) => t.title).filter(Boolean);
  const topPlaces = placesContext.slice(0, 4).map((p) => p.name).filter(Boolean);
  const filteredByBudget =
    Number.isFinite(budget) && budget > 0
      ? tripsContext
          .filter((t) => Number.isFinite(Number(t.price)) && Number(t.price) <= budget)
          .slice(0, 3)
      : [];

  if (isArabic) {
    if (/^(hi|hello|hey|ahlan|salam|marhaba|izayak)/i.test(text) || text.length <= 6) {
      return [
        '????? ??? ?? **Kemet Travel**.',
        '',
        '**???? ?????? ?? ????**',
        '- ????? ???? ??? ?????????',
        '- ??? ????? ??? ????',
        '- ???? ????? ?? ????? ?????',
      ].join('\n');
    }

    if (filteredByBudget.length) {
      return [
        `?????. ??? ??????? ????? **${budget.toLocaleString('en-US')}**? ?? ???? ????? ?????:`,
        '',
        ...filteredByBudget.map(
          (trip) =>
            `- **${trip.title || 'Trip'}**: ????? **${Number(trip.price || 0).toLocaleString('en-US')} ${trip.currency || 'EGP'}** (${trip.duration || '??? ??? ?????'})`
        ),
        '',
        '?? ??? ?????? ??? ????? ?? ?????? ??????? ???? ??? ????? ???????.',
      ].join('\n');
    }

    return [
      '????? ??? ????.',
      '',
      '**???????? ????? ?? Kemet Travel:**',
      ...(topTrips.length ? topTrips.map((x) => `- ????: **${x}**`) : ['- ????? ????? ????? ?????? ??? ???? Trips']),
      ...(topPlaces.length ? topPlaces.map((x) => `- ????: **${x}**`) : ['- ????? ????? ????? ??? ???? Explore']),
      '',
      '?? ???? ???? ????????? ?????? ???? ?????? ??? ????? ???? ?????.',
    ].join('\n');
  }

  if (/^(hi|hello|hey)/i.test(text)) {
    return [
      'Welcome to **Kemet Travel**.',
      '',
      '**I can help you with:**',
      '- Trip recommendations by budget',
      '- Day-by-day place planning',
      '- Best nearby hotels and attractions',
    ].join('\n');
  }

  if (filteredByBudget.length) {
    return [
      `Great. With a budget around **${budget.toLocaleString('en-US')}**, here are suitable trips:`,
      '',
      ...filteredByBudget.map(
        (trip) =>
          `- **${trip.title || 'Trip'}**: about **${Number(trip.price || 0).toLocaleString('en-US')} ${trip.currency || 'EGP'}** (${trip.duration || 'duration n/a'})`
      ),
      '',
      'Tell me your preferred duration and I will build the best itinerary.',
    ].join('\n');
  }

  return [
    'Absolutely, I am with you.',
    '',
    '**Quick picks from Kemet Travel:**',
    ...(topTrips.length ? topTrips.map((x) => `- Trip: **${x}**`) : ['- Great trips are available on the Trips page']),
    ...(topPlaces.length ? topPlaces.map((x) => `- Place: **${x}**`) : ['- Great places are available on the Explore page']),
    '',
    'Share your budget and duration, and I will build a precise plan for you.',
  ].join('\n');
};

const resolveUserIdFromRequest = (req) => {
  const bodyUserId = String(req.body?.userId || req.query?.userId || '').trim();
  if (bodyUserId) return bodyUserId;

  const headerUserId = String(req.headers?.['x-user-id'] || '').trim();
  if (headerUserId) return headerUserId;

  const authHeader = String(req.headers?.authorization || '').trim();
  if (/^Bearer\s+/i.test(authHeader)) {
    const tokenValue = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (tokenValue) return tokenValue;
  }

  return 'guest_user';
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'Kemet Travel API' });
});

app.get('/api/chat/history/:userId', async (req, res) => {
  try {
    const routeUserId = String(req.params?.userId || '').trim();
    const userId = routeUserId || resolveUserIdFromRequest(req);

    const chatHistory = await ChatHistory.findOne({ userId }).lean();
    const messages = Array.isArray(chatHistory?.messages) ? chatHistory.messages.slice(-10) : [];

    res.json({
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Chat history error: ' + err.message });
  }
});

app.delete('/api/chat/history/:userId', async (req, res) => {
  try {
    const routeUserId = String(req.params?.userId || '').trim();
    const userId = routeUserId || resolveUserIdFromRequest(req);

    await ChatHistory.updateOne(
      { userId },
      { $set: { messages: [] } },
      { upsert: true }
    );

    res.json({ message: 'Chat cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Clear chat error: ' + err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    console.log('Incoming Request Body:', req.body);
    console.log('Incoming Content-Type:', req.headers['content-type'] || 'none');
    const userId = resolveUserIdFromRequest(req);
    const userMessage = String(req.body?.message || req.query?.message || '').trim();
    if (req.body?.userId === 'guest_user') {
      console.log('Guest user detected, proceeding to AI without database restriction.');
    }

    if (!userMessage) {
      return res.status(400).json({ message: 'message is required' });
    }

    let dbHistory = [];
    try {
      const chatHistoryDoc = await ChatHistory.findOne({ userId });
      dbHistory = Array.isArray(chatHistoryDoc?.messages) ? chatHistoryDoc.messages : [];
    } catch (dbReadError) {
      console.log('Chat DB read error:', dbReadError.message);
      dbHistory = [];
    }

    const safeHistory = dbHistory
      .filter((msg) => msg && typeof msg === 'object')
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: String(msg.content || '').slice(0, 1200),
      }))
      .filter((msg) => msg.content)
      .slice(-5);

    const replyStyleInstruction = detectReplyStyle(userMessage, safeHistory);
    const [tripsContext, placesContext] = await Promise.all([
      Trips.find({ isReady: true })
        .select('title price duration location currency isReady')
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Place.find({})
        .select('name entryFee location category rating openingHours isPopular isTopExperience')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const tripsText = tripsContext.length
      ? tripsContext
          .map(
            (trip) =>
              `- ${trip.title || 'Trip'} | Price: ${trip.price ?? 'N/A'} ${trip.currency || 'EGP'} | Duration: ${
                trip.duration || 'N/A'
              } | Location: ${trip.location || 'Egypt'} | Ready: ${trip.isReady ? 'Yes' : 'No'}`
          )
          .join('\n')
      : '- No trips available now';

    const placesText = placesContext.length
      ? placesContext
          .map(
            (place) =>
              `- ${place.name || 'Place'} | Entry Fee: ${place.entryFee ?? 'N/A'} EGP | Location: ${
                place.location || 'Egypt'
              } | Category: ${place.category || 'N/A'} | Rating: ${place.rating ?? 'N/A'} | Popular: ${
                place.isPopular ? 'Yes' : 'No'
              } | Top Experience: ${place.isTopExperience ? 'Yes' : 'No'}`
          )
          .join('\n')
      : '- No places available now';

    const nextMessages = [...dbHistory, { role: 'user', content: userMessage, timestamp: new Date() }];

    let reply = '';
    if (!cleanEnv(process.env.OPENAI_API_KEY)) {
      reply = buildOfflineReply(userMessage, tripsContext, placesContext);
    } else {
      try {
        const systemPrompt =
          '??? ???? ????? ????? Kemet Travel. ????? ??????? ??????? ??????? ???? ??????? ?????. ?????? ?????? ??????? ???????? ??????? ???????? ?? ?????? ???????. ?????? Markdown ????? ??????? ?????.\n' +
          `${replyStyleInstruction}\n\nTrips (ready only):\n${tripsText}\n\nPlaces:\n${placesText}`;
        const message = userMessage;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': APP_REFERER,
            'X-Title': APP_TITLE,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            max_tokens: 1024,
            messages: [
              { role: 'system', content: systemPrompt },
              ...safeHistory,
              { role: 'user', content: message },
            ],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error?.message || data?.message || `OpenRouter error: ${response.status}`);
        }

        if (data.choices && data.choices[0]) {
          reply = String(data.choices[0].message?.content || '').trim();
          console.log('AI Response from OpenRouter:', data.choices[0].message?.content || '');
        } else {
          throw new Error('No response from AI');
        }
      } catch (error) {
        console.error('AI Detailed Error:', error.message);
        reply = '???? ??????? ???? ??? ????? ?? ??? ????.. ??? ?????? ???? ??????';
      }
    }

    if (!reply) {
      reply = buildOfflineReply(userMessage, tripsContext, placesContext);
    }

    try {
      nextMessages.push({ role: 'assistant', content: reply, timestamp: new Date() });
      const boundedMessages = nextMessages.slice(-100);
      await ChatHistory.updateOne(
        { userId },
        { $set: { messages: boundedMessages } },
        { upsert: true }
      );
    } catch (dbWriteError) {
      console.log('Chat DB write error:', dbWriteError.message);
    }

    console.log('AI is about to send this reply:', reply);
    res.json({ message: reply, reply });
  } catch (err) {
    res.status(500).json({ message: 'Chat error: ' + err.message });
  }
});

app.get('/api/trips', async (req, res) => {
  try {
    let filter = {};
    if (req.query.ready === 'true') {
      filter.isReady = true;
    }
    const trips = await Trips.find(filter).sort({ createdAt: -1 }).lean();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trips: ' + err.message });
  }
});

app.get('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid trip id format' });
    }

    const trip = await Trips.findById(id).lean();
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trip: ' + err.message });
  }
});

app.get('/api/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hotels: ' + err.message });
  }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid hotel id format' });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hotel: ' + err.message });
  }
});

app.get('/api/places', async (req, res) => {
  try {
    let query = {};

    // ?? ???? popular=true? ??? ?? ???? ??? isPopular ????? true
    if (req.query.popular === 'true') {
      query.isPopular = true;
    }
    // ?? ???? top=true? ??? ?? ???? ??? isTopExperience ????? true
    if (req.query.top === 'true') {
      query.isTopExperience = true;
    }

    const places = await Place.find(query).lean();
    res.json(places.map(enrichPlaceForResponse));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid place id format' });
    }

    const place = await Place.findById(id).lean();
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json(enrichPlaceForResponse(place));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching place: ' + err.message });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const newTrip = new Trip(req.body);
    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (err) {
    res.status(400).json({ message: 'Error saving trip: ' + err.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // ✅ التحقق من قوة الباسورد
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // ✅ الباسورد هيتشفر تلقائياً عن طريق pre('save') في الـ Model
    const newUser = new User({ name, email, password, phone: String(phone || '').trim(), loyaltyPoints: 0 });
    await newUser.save();

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
        loyaltyPoints: Number(newUser.loyaltyPoints || 0),
        token: String(newUser._id),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error during signup: ' + err.message });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // ✅ ابحث بالإيميل فقط، وبعدين قارن الباسورد بـ bcrypt
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        loyaltyPoints: Number(user.loyaltyPoints || 0),
        token: String(user._id),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error during login: ' + err.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ✅ شفّر الـ OTP قبل الحفظ في الداتابيز
    const hashedOtp = await bcrypt.hash(otp, 10);
    user.resetOtp = hashedOtp;
    user.resetOtpExpiresAt = expiresAt;
    await user.save();

    const transporter = getMailTransporter();
    if (!transporter) {
      return res.status(500).json({
        message: 'Email service is not configured. Please set SMTP env values on server.',
      });
    }

    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Kemet Travel | Password Reset OTP Code',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.7;color:#1f2937">
          <h2 style="margin:0 0 12px;color:#775a19">Kemet Travel</h2>
          <p style="margin:0 0 8px"><strong>Password Reset Verification</strong></p>
          <p style="margin:0 0 8px">Your One-Time Password (OTP) is:</p>
          <p style="font-size:30px;font-weight:700;letter-spacing:4px;margin:10px 0;color:#111827">${otp}</p>
          <p style="margin:0 0 16px">This code will expire in <strong>10 minutes</strong>.</p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />

          <p style="margin:0 0 8px"><strong>????? ????? ???? ??????</strong></p>
          <p style="margin:0 0 8px">??? ?????? ????? ?? ??:</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:4px;margin:10px 0;color:#111827">${otp}</p>
          <p style="margin:0 0 16px">????? ???? ???? <strong>10 ?????</strong>.</p>

          <p style="font-size:12px;color:#6b7280;margin-top:16px">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`[KEMET OTP SENT] ${email} (expires ${expiresAt.toISOString()})`);
    res.json({ message: 'OTP sent successfully to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Error generating OTP: ' + err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    if (!user.resetOtp || !user.resetOtpExpiresAt) {
      return res.status(400).json({ message: 'No active OTP. Request a new one.' });
    }
    if (new Date(user.resetOtpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }

    // ✅ قارن الـ OTP المدخول بالـ OTP المشفر في الداتابيز
    const otpMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!otpMatch) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // ✅ الباسورد الجديد هيتشفر تلقائياً عن طريق pre('save')
    user.password = newPassword;
    user.resetOtp = '';
    user.resetOtpExpiresAt = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password: ' + err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, tripId, travelerDetails, totalPrice, paymentMethod } = req.body;

    if (!userId || !tripId) {
      return res.status(400).json({ message: 'userId and tripId are required' });
    }

    if (!travelerDetails || typeof travelerDetails !== 'object') {
      return res.status(400).json({ message: 'travelerDetails are required' });
    }

    const fullName = String(travelerDetails.fullName || '').trim();
    const email = String(travelerDetails.email || '').trim();
    const phone = String(travelerDetails.phone || '').trim();
    const nationality = String(travelerDetails.nationality || '').trim();

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: 'Traveler fullName, email and phone are required' });
    }

    const parsedTotalPrice = Number(totalPrice);
    if (!Number.isFinite(parsedTotalPrice) || parsedTotalPrice < 0) {
      return res.status(400).json({ message: 'A valid totalPrice is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: 'Invalid userId or tripId format' });
    }

    const method = paymentMethod === 'paypal' ? 'paypal' : 'card';

    const [user, trip] = await Promise.all([User.findById(userId), Trip.findById(tripId)]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const savedBooking = await new Booking({
      user: userId,
      trip: tripId,
      travelerDetails: {
        fullName,
        email,
        phone,
        nationality,
      },
      totalPrice: parsedTotalPrice,
      paymentMethod: method,
      status: 'Confirmed',
    }).save();

    const loyaltyEarned = Math.max(1, Math.floor(parsedTotalPrice / 100));
    await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: loyaltyEarned } });
    const populatedBooking = await Booking.findById(savedBooking._id).populate('trip');

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: savedBooking._id,
      loyaltyEarned,
      booking: populatedBooking,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error during booking: ' + err.message });
  }
});

app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const bookings = await Booking.find({ user: userId }).populate('trip').sort({ bookingDate: -1 });
    const normalized = bookings.map((b) => {
      const obj = b.toObject();
      if (String(obj.status || '').toLowerCase() === 'pending') obj.status = 'Confirmed';
      return obj;
    });
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings: ' + err.message });
  }
});

app.get('/api/bookings/:userId/audit', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const bookings = await Booking.find({ user: userId })
      .populate('trip')
      .sort({ bookingDate: -1 })
      .lean();

    const audit = bookings.map((b) => ({
      bookingId: b._id,
      tripTitle: b.trip?.title || b.trip?.name || 'Trip',
      totalPrice: Number(b.totalPrice || 0),
      status: String(b.status || 'Confirmed').toLowerCase() === 'pending' ? 'Confirmed' : String(b.status || 'Confirmed'),
      paymentMethod: b.paymentMethod || 'card',
      bookedAt: b.bookingDate || b.createdAt || null,
      traveler: b.travelerDetails?.fullName || '',
    }));

    res.json({ count: audit.length, audit });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching booking audit: ' + err.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    const user = await User.findById(userId).select('name email phone loyaltyPoints');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user profile: ' + err.message });
  }
});

app.patch('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    const updates = {};
    if (String(name || '').trim()) updates.name = String(name).trim();
    if (String(email || '').trim()) updates.email = String(email).trim().toLowerCase();
    if (typeof phone !== 'undefined') updates.phone = String(phone || '').trim();
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'Provide name, email or phone to update' });
    }
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('name email phone loyaltyPoints');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile: ' + err.message });
  }
});

app.patch('/api/users/:userId/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    if (!String(currentPassword || '').trim() || !String(newPassword || '').trim()) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ قارن الباسورد الحالي بـ bcrypt
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // ✅ الباسورد الجديد هيتشفر تلقائياً عن طريق pre('save')
    user.password = String(newPassword);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password: ' + err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    env: isProduction ? 'production' : 'development',
    port: PORT,
    appVersion: APP_VERSION,
    dbState: mongoose.connection.readyState,
    ts: new Date().toISOString(),
  });
});

// ─── UserPlan: حفظ خطة المستخدم في MongoDB ───────────────────────────────
const userPlanSchema = new mongoose.Schema(
  {
    userId:    { type: String, required: true, unique: true, index: true },
    data:      { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'userplans' }
);
const UserPlan = mongoose.models.UserPlan || mongoose.model('UserPlan', userPlanSchema);

// GET /api/userplans/:userId  — جيب الخطة
app.get('/api/userplans/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const doc = await UserPlan.findOne({ userId }).lean();
    if (!doc) return res.status(404).json({ message: 'No plan found' });
    res.json({ data: doc.data, updatedAt: doc.updatedAt });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching plan: ' + err.message });
  }
});

// PUT /api/userplans/:userId  — احفظ/حدّث الخطة
app.put('/api/userplans/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const { data } = req.body || {};
    if (!data || typeof data !== 'object') return res.status(400).json({ message: 'data object required' });
    const doc = await UserPlan.findOneAndUpdate(
      { userId },
      { $set: { data, updatedAt: new Date() } },
      { upsert: true, new: true, lean: true }
    );
    res.json({ ok: true, updatedAt: doc.updatedAt });
  } catch (err) {
    res.status(500).json({ message: 'Error saving plan: ' + err.message });
  }
});

// DELETE /api/userplans/:userId  — امسح الخطة
app.delete('/api/userplans/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    await UserPlan.deleteOne({ userId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting plan: ' + err.message });
  }
});

// Legacy alias /api/user-plan/:userId (backward compat)
app.get('/api/user-plan/:userId', async (req, res) => {
  try {
    const doc = await UserPlan.findOne({ userId: req.params.userId }).lean();
    if (!doc) return res.status(404).json({ message: 'No plan found' });
    res.json({ data: doc.data, updatedAt: doc.updatedAt });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
app.put('/api/user-plan/:userId', async (req, res) => {
  try {
    const { data } = req.body || {};
    if (!data) return res.status(400).json({ message: 'data required' });
    const doc = await UserPlan.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { data, updatedAt: new Date() } },
      { upsert: true, new: true, lean: true }
    );
    res.json({ ok: true, updatedAt: doc.updatedAt });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
app.delete('/api/user-plan/:userId', async (req, res) => {
  try {
    await UserPlan.deleteOne({ userId: req.params.userId });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// ─────────────────────────────────────────────────────────────────────────────

// Only listen when run directly (local dev), not when required by Vercel
if (require.main === module) {
  mongoose.connection.asPromise()
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`OpenRouter Connection Established -> baseURL: ${OPENROUTER_BASE_URL}, model: ${OPENROUTER_MODEL}`);
      });
      server.timeout = 90000;
    })
    .catch((err) => {
      console.error('Failed to start server - MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;