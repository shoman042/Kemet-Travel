(function () {
  const API_BASE_URL =
    String(window.KEMET_API_BASE_URL || localStorage.getItem('kemet-api-base-url') || '').trim() ||
    `${window.location.protocol}//${window.location.host}`;
  const SESSION_KEY = 'kemet-session';
  const SELECTED_TRIP_KEY = 'kemet-selected-trip';
  const PLAN_KEY = 'kemet-my-plan';
  const TRIP_CATALOG_KEY = 'kemet-trip-catalog';
  const TRIP_DATES_KEY = 'kemet-trip-dates';
  const TRIP_PLAN_SELECTED_KEY = 'kemet-selected-plan-trip-name';
  const TRIP_META_KEY = 'kemet-trip-meta';
  const PAYMENT_TRIP_NAMES_KEY = 'kemet-payment-trip-names';
  const SAVED_DESTINATIONS_KEY = 'kemet-saved-destinations';
  const BOOKING_MODE_KEY = 'kemet-booking-mode';
  const LAST_PAYMENT_KEY = 'kemet-last-payment';
  const CHAT_MEMORY_LIMIT = 5;
  const CHAT_STORAGE_KEY = 'kemet-chat-memory';
  const ENABLE_GLOBAL_LOADER = false;
  const PLACE_IMAGE_NAME_MAP = {
    'pyramids1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg',
    'pyramids2.jpg': 'https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg',
    'karnak1.jpg': 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1400&q=80',
    'karnak2.jpg': 'https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=1400&q=80',
    'khan1.jpg': 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1400&q=80',
    'khan2.jpg': 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1400&q=80',
    'abusimbel1.jpg': 'https://images.unsplash.com/photo-1566192091743-5966a6079984?auto=format&fit=crop&w=1400&q=80',
    'abusimbel2.jpg': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
    'montaza1.jpg': 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1400&q=80',
    'montaza2.jpg': 'https://images.unsplash.com/photo-1524492514790-831f5b0d4af1?auto=format&fit=crop&w=1400&q=80',
  };
  const TRIP_IMAGE_TITLE_MAP = {
    'ancient wonders tour':
      'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg',
    'nile & red sea escape':
      'https://upload.wikimedia.org/wikipedia/commons/6/6f/Red_Sea_Coral_Reef.jpg',
    'cairo city essence':
      'https://upload.wikimedia.org/wikipedia/commons/4/4f/Cairo_by_night.jpg',
  };
  const PLACE_IMAGE_TITLE_MAP = {
    'the egyptian museum': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Egyptian_Museum%2C_Cairo%2C_1902.jpg',
    'khan el-khalili': 'https://upload.wikimedia.org/wikipedia/commons/7/79/Khan_el_Khalili.jpg',
    'khan el khalili': 'https://upload.wikimedia.org/wikipedia/commons/7/79/Khan_el_Khalili.jpg',
    'mount sinai': 'https://upload.wikimedia.org/wikipedia/commons/3/38/Mount_Sinai.jpg',
    'ras mohammed national park': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Ras_Mohammed_National_Park.jpg',
    'karnak temple complex': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Karnak_Temple_Complex.jpg',
    'the citadel of saladin': 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Cairo_Citadel.jpg',
    'the great pyramids of giza': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg',
    'abu simbel temples': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Abu_Simbel%2C_Ramesses_Temple%2C_front%2C_Egypt%2C_Oct_2004.jpg',
    'montaza palace gardens': 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Montaza_Palace_Gardens.jpg',
  };
  const IMAGE_PLACEHOLDER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">' +
        '<rect width="1200" height="800" fill="#f4f3f1"/>' +
        '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7f7667" font-family="Arial, sans-serif" font-size="42">' +
        'Kemet Travel Image' +
        '</text>' +
      '</svg>'
    );

  const routes = {
    home: 'index.html',
    explore: 'explore.html',
    trips: 'trips.html',
    myTrip: 'my-trip.html',
    place: 'place.html',
    hotels: 'hotels.html',
    hotelDetails: 'hotel-details.html',
    tripDetails: 'trip-details.html',
    booking: 'booking.html',
    success: 'success.html',
    confirmation: 'confirmation.html',
    dashboard: 'dashboard.html',
    profileSettings: 'profile-settings.html',
    support: 'support.html',
    login: 'login.html',
    signup: 'signup.html',
  };

  function userScopedKey(baseKey, userId) {
    const id = String(userId || 'guest').trim() || 'guest';
    return `${baseKey}:${id}`;
  }

  const page = decodeURIComponent(window.location.pathname.split('/').pop() || routes.home);
  const navPages = new Set(Object.values(routes));
  const HYDRATION_SHIELD_ID = 'kemet-hydration-shield-style';

  function getHydrationSelectors(pageName) {
    if (pageName === routes.trips) return ['section .grid'];
    if (pageName === routes.explore) return ['#explore-place-grid'];
    if (pageName === routes.hotels) return ['#hotel-list'];
    if (pageName === routes.home) return ['#home-popular-places', '#home-top-experiences', '#home-ready-journeys'];
    if (pageName === routes.dashboard) return ['main section .bg-surface-container-lowest'];
    if (pageName === routes.place) return ['#place-main-image', '#place-thumb-1', '#place-thumb-2', '#place-title', '#place-location', '#place-description', '#place-category', '#place-rating', '#place-opening-hours', '#place-entry-fee'];
    if (pageName === routes.hotelDetails) return ['#hotel-main-image', '#hotel-thumb-1', '#hotel-thumb-2', '#hotel-thumb-3', '#hotel-title', '#hotel-breadcrumb-title', '#hotel-location', '#hotel-rating', '#hotel-price', '#hotel-amenities', '#hotel-description'];
    return [];
  }

  function applyHydrationShield() {
    const selectors = getHydrationSelectors(page);
    if (!selectors.length) return;
    if (document.getElementById(HYDRATION_SHIELD_ID)) return;
    const style = document.createElement('style');
    style.id = HYDRATION_SHIELD_ID;
    style.textContent = selectors.map((s) => `${s}{visibility:hidden !important;}`).join('\n');
    document.head.appendChild(style);
    setTimeout(() => document.getElementById(HYDRATION_SHIELD_ID)?.remove(), 800);
  }

  function removeHydrationShield() {
    document.getElementById(HYDRATION_SHIELD_ID)?.remove();
  }

  applyHydrationShield();

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    if (guardProtectedPage()) return;

    // Skip standardizeHeader for login page to preserve its custom header
    if (navPages.has(page) && page !== routes.login) {
      standardizeHeader();
      adjustTopSpacing();
    }

    preparePageForHydration();

    wireForms();

    try {
      switch (page) {
        case routes.home:
          await wireHomePage();
          break;
        case routes.explore:
          wireExplorePage();
          break;
        case routes.place:
          await wirePlacePage();
          break;
        case routes.myTrip:
          wireMyTripPage();
          break;
        case routes.hotels:
          await wireHotelsPage();
          break;
        case routes.hotelDetails:
          await wireHotelDetailsPage();
          break;
        case routes.trips:
          await wireTripsPage();
          break;
        case routes.tripDetails:
          await wireTripDetailsPage();
          break;
        case routes.booking:
          await wireBookingPage();
          break;
        case routes.success:
        case routes.confirmation:
          wireConfirmationPage();
          break;
        case routes.dashboard:
          await wireDashboardPage();
          break;
        case routes.profileSettings:
          await wireProfileSettingsPage();
          break;
        case routes.support:
          wireSupportPage();
          break;
        default:
          break;
      }
    } finally {
      removeHydrationShield();
    }

    wireFallbackLinks();
    applyImageFallbacks();
    initKemetAssistantWidget();
  }

  function preparePageForHydration() {
    const loadingBox = (columns = 1) =>
      `<div class="${columns > 1 ? `md:col-span-${columns}` : ''} bg-white rounded-xl border border-outline-variant p-8 text-center text-on-surface-variant">Loading...</div>`;

    if (page === routes.trips) {
      const grid = document.querySelector('section .grid');
      if (grid) grid.innerHTML = `${loadingBox(3)}${loadingBox(3)}${loadingBox(3)}`;
      return;
    }

    if (page === routes.explore) {
      const grid = document.getElementById('explore-place-grid');
      if (grid) grid.innerHTML = loadingBox(2);
      return;
    }

    if (page === routes.hotels) {
      const host = document.getElementById('hotel-list');
      if (host) host.innerHTML = loadingBox(1);
      return;
    }

    if (page === routes.home) {
      const popular = document.getElementById('home-popular-places');
      const top = document.getElementById('home-top-experiences');
      const ready = document.getElementById('home-ready-journeys');
      if (popular) popular.innerHTML = loadingBox(1);
      if (top) top.innerHTML = loadingBox(1);
      if (ready) ready.innerHTML = loadingBox(3);
    }
  }

  function normalizeText(value) {
    return (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function findButtonByText(text, root = document) {
    const needle = normalizeText(text);
    return Array.from(root.querySelectorAll('button')).find((b) => normalizeText(b.textContent).includes(needle));
  }

  function findLinkByText(text, root = document) {
    const needle = normalizeText(text);
    return Array.from(root.querySelectorAll('a')).find((a) => normalizeText(a.textContent).includes(needle));
  }

  // Keys that must be scoped per user
  const USER_SCOPED_KEYS = new Set([
    'kemet-my-plan',
    'kemet-trip-catalog',
    'kemet-trip-dates',
    'kemet-selected-plan-trip-name',
    'kemet-trip-meta',
    'kemet-payment-trip-names',
    'kemet-saved-destinations',
    'kemet-booking-mode',
    'kemet-last-payment',
    'kemet-selected-trip',
  ]);

  function getScopedKey(key) {
    if (!USER_SCOPED_KEYS.has(key)) return key;
    const userId = getState.__rawGet(SESSION_KEY)?.userId || getState.__rawGet(SESSION_KEY)?.id || 'guest';
    return `${key}:${String(userId).trim() || 'guest'}`;
  }

  function setState(key, value) {
    localStorage.setItem(getScopedKey(key), JSON.stringify(value));
  }

  function getState(key, fallback) {
    try {
      const value = localStorage.getItem(getScopedKey(key));
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  // Raw getter used internally by getScopedKey (avoids infinite recursion)
  getState.__rawGet = function(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  function navigate(target) {
    window.location.href = target;
  }

  function normalizeUser(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const userId = raw.userId || raw.id || raw._id || null;
    if (!userId) return null;
    return { ...raw, id: userId, userId };
  }

  function getSessionUser() {
    const user = normalizeUser(getState(SESSION_KEY, null));
    if (user) setState(SESSION_KEY, user);
    return user;
  }

  function isAuthenticated() {
    return !!getSessionUser()?.userId;
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('userId');
    localStorage.removeItem(CHAT_STORAGE_KEY);
    document.getElementById('kemet-ai-widget-root')?.remove();
  }

  function guardProtectedPage() {
    const protectedPages = new Set([routes.dashboard, routes.booking, routes.confirmation, routes.myTrip, routes.profileSettings]);
    if (!protectedPages.has(page)) return false;
    if (!isAuthenticated()) {
      navigate(routes.login);
      return true;
    }
    return false;
  }

  function showToast(message, type = 'info') {
    const variants = {
      info: {
        box: 'bg-gradient-to-r from-[#1f1b16] to-[#2a2318] border-[#c5a059]/50',
        icon: 'notifications',
        iconColor: 'text-[#d9b56a]',
      },
      success: {
        box: 'bg-gradient-to-r from-[#0f2a1f] to-[#143526] border-[#3eb489]/50',
        icon: 'check_circle',
        iconColor: 'text-[#5fd1a4]',
      },
      error: {
        box: 'bg-gradient-to-r from-[#3a1212] to-[#4a1818] border-[#ff7b7b]/50',
        icon: 'error',
        iconColor: 'text-[#ff9e9e]',
      },
    };
    const theme = variants[type] || variants.info;

    const host =
      document.getElementById('kemet-toast-host') ||
      (() => {
        const h = document.createElement('div');
        h.id = 'kemet-toast-host';
        h.className = 'fixed top-20 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-[99999] w-[min(92vw,560px)]';
        document.body.appendChild(h);
        return h;
      })();

    const t = document.createElement('div');
    t.className =
      `${theme.box} text-white px-4 py-3 rounded-xl shadow-2xl border text-[15px] font-medium flex items-start gap-3`;
    t.innerHTML = `
      <span class="material-symbols-outlined ${theme.iconColor} mt-[1px]" style="font-variation-settings:'FILL' 1">${theme.icon}</span>
      <div class="leading-6">${escapeHtml(String(message || ''))}</div>
    `;
    host.appendChild(t);

    requestAnimationFrame(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(-8px) scale(0.98)';
      t.style.transition = 'all .2s ease';
      requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0) scale(1)';
      });
    });

    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(-8px) scale(0.98)';
      setTimeout(() => t.remove(), 220);
    }, 4200);
  }

  function showSuccess(message) {
    showToast(message, 'success');
  }

  function showError(message) {
    showToast(message, 'error');
  }

  function askInputModal({ title = 'Input Required', label = '', defaultValue = '', type = 'text', placeholder = '' } = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[100001] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4';
      overlay.innerHTML = `
        <div class="w-full max-w-md rounded-2xl border border-[#c5a059]/50 bg-[#1f1b16] text-white shadow-2xl p-5">
          <h3 class="text-lg font-bold mb-2">${escapeHtml(title)}</h3>
          ${label ? `<p class="text-sm text-white/75 mb-3">${escapeHtml(label)}</p>` : ''}
          <input id="kemet-modal-input" type="${escapeHtml(type)}" value="${escapeHtml(defaultValue)}" placeholder="${escapeHtml(
            placeholder
          )}" class="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#d9b56a]"/>
          <div class="mt-4 flex justify-end gap-2">
            <button id="kemet-modal-cancel" class="px-4 py-2 rounded-lg border border-white/25 text-white/90">Cancel</button>
            <button id="kemet-modal-ok" class="px-4 py-2 rounded-lg bg-[#775a19] text-white font-bold">Continue</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      const input = overlay.querySelector('#kemet-modal-input');
      const cleanup = (value) => {
        overlay.remove();
        resolve(value);
      };
      overlay.querySelector('#kemet-modal-cancel')?.addEventListener('click', () => cleanup(null));
      overlay.querySelector('#kemet-modal-ok')?.addEventListener('click', () => cleanup(String(input?.value || '').trim()));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(null);
      });
      input?.focus();
      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') cleanup(String(input?.value || '').trim());
        if (e.key === 'Escape') cleanup(null);
      });
    });
  }
  async function askTripSelectModal({ title = 'Select Trip', allowCreate = true } = {}) {
    return new Promise((resolve) => {
      const tripNames = getTripNames();
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[10001] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4';
      let optionsHtml = '';
      if (tripNames.length) {
        optionsHtml = '<option value="">-- Select a trip --</option>';
        tripNames.forEach((name, i) => {
          optionsHtml += '<option value="' + (i+1) + '">' + escapeHtml(name) + '</option>';
        });
        if (allowCreate) {
          optionsHtml += '<option value="__new__">➕ Create New Trip...</option>';
        }
      }
      let bodyHtml = '<div class="w-full max-w-md rounded-2xl border border-[#c5a059]/50 bg-[#1f1b16] text-white shadow-2xl p-5">';
      bodyHtml += '<h3 class="text-lg font-bold mb-4">' + escapeHtml(title) + '</h3>';
      if (tripNames.length) {
        bodyHtml += '<select id="kemet-modal-select" class="w-full px-3 py-2 rounded-lg border border-[#c5a059]/40 bg-[#2d2519] text-white focus:outline-none focus:ring-2 focus:ring-[#d9b56a] mb-3" style="background-color:#2d2519;color:#fff;">' + optionsHtml + '</select>';
        bodyHtml += '<div id="kemet-new-trip-wrapper" class="hidden mb-3"><input id="kemet-new-trip-input" type="text" placeholder="Enter trip name" class="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d9b56a]"/></div>';
      } else {
        bodyHtml += '<p class="text-sm text-white/60 mb-3">No trips yet. Create your first trip:</p>';
        bodyHtml += '<input id="kemet-new-trip-input" type="text" placeholder="Enter trip name" class="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d9b56a] mb-3"/>';
      }
      bodyHtml += '<div class="mt-4 flex justify-end gap-2">';
      bodyHtml += '<button id="kemet-modal-cancel" class="px-4 py-2 rounded-lg border border-white/25 text-white/90">Cancel</button>';
      bodyHtml += '<button id="kemet-modal-ok" class="px-4 py-2 rounded-lg bg-[#775a19] text-white font-bold">Continue</button>';
      bodyHtml += '</div></div>';
      overlay.innerHTML = bodyHtml;
      document.body.appendChild(overlay);

      const select = overlay.querySelector('#kemet-modal-select');
      const newTripWrapper = overlay.querySelector('#kemet-new-trip-wrapper');
      const newTripInput = overlay.querySelector('#kemet-new-trip-input');

      if (select) {
        select.addEventListener('change', () => {
          if (select.value === '__new__') {
            newTripWrapper?.classList.remove('hidden');
            newTripInput?.focus();
          } else {
            newTripWrapper?.classList.add('hidden');
          }
        });
      }

      const cleanup = (value) => {
        overlay.remove();
        resolve(value);
      };

      overlay.querySelector('#kemet-modal-cancel')?.addEventListener('click', () => cleanup(null));
      overlay.querySelector('#kemet-modal-ok')?.addEventListener('click', () => {
        if (select && select.value === '__new__') {
          const newName = String(newTripInput?.value || '').trim();
          cleanup(newName || null);
        } else if (select && select.value && select.value !== '') {
          const idx = Number(select.value) - 1;
          cleanup(idx >= 0 && idx < tripNames.length ? tripNames[idx] : null);
        } else if (!tripNames.length) {
          const newName = String(newTripInput?.value || '').trim();
          cleanup(newName || null);
        } else {
          cleanup(null);
        }
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(null);
      });
      if (!tripNames.length) newTripInput?.focus();
      else select?.focus();
    });
  }

  let loadingCounter = 0;
  function ensureGlobalLoader() {
    let el = document.getElementById('kemet-global-loader');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'kemet-global-loader';
    el.className = 'fixed inset-0 z-[100000] hidden items-center justify-center bg-black/25 backdrop-blur-[1px]';
    el.innerHTML = `
      <div class="px-5 py-4 rounded-xl border border-[#c5a059]/50 bg-[#1f1b16] text-white shadow-2xl flex items-center gap-3">
        <span class="material-symbols-outlined text-[#d9b56a] animate-pulse" style="font-variation-settings:'FILL' 1">progress_activity</span>
        <span class="text-sm font-semibold tracking-wide">Loading...</span>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  function showGlobalLoader() {
    if (!ENABLE_GLOBAL_LOADER) return;
    loadingCounter += 1;
    const loader = ensureGlobalLoader();
    loader.classList.remove('hidden');
    loader.classList.add('flex');
  }

  function hideGlobalLoader() {
    if (!ENABLE_GLOBAL_LOADER) return;
    loadingCounter = Math.max(0, loadingCounter - 1);
    if (loadingCounter > 0) return;
    const loader = document.getElementById('kemet-global-loader');
    if (!loader) return;
    loader.classList.add('hidden');
    loader.classList.remove('flex');
  }

  function initKemetAssistantWidget() {
    if (document.getElementById('kemet-ai-widget-root')) return;

    const root = document.createElement('div');
    root.id = 'kemet-ai-widget-root';
    root.innerHTML = `
      <style>
        #kemet-ai-widget-root{position:fixed;right:22px;bottom:22px;z-index:99999;font-family:'Cairo','Tajawal','Noto Sans Arabic','Plus Jakarta Sans',sans-serif}
        .kemet-ai-fab{width:58px;height:58px;border-radius:999px;border:none;cursor:pointer;background:linear-gradient(145deg,#c5a059,#775a19);color:#fff;box-shadow:0 12px 28px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center}
        .kemet-ai-panel{width:min(450px,calc(100vw - 20px));height:620px;max-height:78vh;background:rgba(22,24,27,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(197,160,89,.45);border-radius:16px;box-shadow:0 18px 38px rgba(0,0,0,.35);display:none;overflow:hidden}
        .kemet-ai-panel.open{display:flex;flex-direction:column}
        .kemet-ai-head{padding:12px 14px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,rgba(197,160,89,.2),rgba(197,160,89,.05));border-bottom:1px solid rgba(197,160,89,.35);color:#f7f2e8}
        .kemet-ai-title{font-size:15px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
        .kemet-ai-head-actions{display:flex;align-items:center;gap:8px}
        .kemet-ai-clear{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:#f7f2e8;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer}
        .kemet-ai-close{background:transparent;border:none;color:#f7f2e8;cursor:pointer}
        .kemet-ai-body{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
        .kemet-ai-msg{max-width:88%;padding:12px 14px;border-radius:12px;font-size:15px;line-height:1.8;white-space:pre-wrap;word-break:break-word}
        .kemet-ai-msg.rtl{direction:rtl;text-align:right}
        .kemet-ai-msg.ltr{direction:ltr;text-align:left}
        .kemet-ai-msg.user{align-self:flex-end;background:#c5a059;color:#1f1400}
        .kemet-ai-msg.assistant{align-self:flex-start;background:rgba(255,255,255,.1);color:#f2f2f2;border:1px solid rgba(255,255,255,.08)}
        .kemet-ai-typing{font-size:13px;color:#d9c8a1;padding:0 12px 8px;display:flex;align-items:center;gap:8px}
        .kemet-ai-dots{display:inline-flex;gap:4px;align-items:center}
        .kemet-ai-dots span{width:6px;height:6px;border-radius:50%;background:#d9c8a1;display:inline-block;opacity:.35;animation:kemetDotPulse 1.2s infinite ease-in-out}
        .kemet-ai-dots span:nth-child(2){animation-delay:.2s}
        .kemet-ai-dots span:nth-child(3){animation-delay:.4s}
        @keyframes kemetDotPulse{0%,80%,100%{transform:translateY(0);opacity:.25}40%{transform:translateY(-3px);opacity:1}}
        .kemet-ai-foot{padding:10px;border-top:1px solid rgba(197,160,89,.3);display:flex;gap:8px;background:rgba(0,0,0,.16)}
        .kemet-ai-input{flex:1;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:12px 12px;font-size:15px;direction:auto}
        .kemet-ai-input::placeholder{color:#cfcfcf}
        .kemet-ai-send{background:#775a19;color:#fff;border:none;border-radius:10px;padding:0 14px;font-size:14px;font-weight:700;cursor:pointer}
      </style>
      <div class="kemet-ai-panel" id="kemet-ai-panel">
        <div class="kemet-ai-head">
          <span class="kemet-ai-title">Kemet Assistant</span>
          <div class="kemet-ai-head-actions">
            <button class="kemet-ai-clear" id="kemet-ai-clear" type="button">Clear Chat</button>
            <button class="kemet-ai-close" id="kemet-ai-close" aria-label="Close" type="button">
              <span class="material-symbols-outlined" data-icon="close">close</span>
            </button>
          </div>
        </div>
        <div class="kemet-ai-body" id="kemet-ai-body"></div>
        <div class="kemet-ai-typing" id="kemet-ai-typing" style="display:none;">
          <span>Kemet Assistant is typing</span>
          <span class="kemet-ai-dots" aria-hidden="true"><span></span><span></span><span></span></span>
        </div>
        <form class="kemet-ai-foot" id="kemet-ai-form">
          <input class="kemet-ai-input" id="kemet-ai-input" placeholder="اسألني عن الرحلات والأماكن..." maxlength="600"/>
          <button class="kemet-ai-send" type="submit">Send</button>
        </form>
      </div>
      <button class="kemet-ai-fab" id="kemet-ai-fab" aria-label="Open Kemet Assistant">
        <span class="material-symbols-outlined" data-icon="chat">chat</span>
      </button>
    `;
    document.body.appendChild(root);

    const panel = document.getElementById('kemet-ai-panel');
    const body = document.getElementById('kemet-ai-body');
    const typing = document.getElementById('kemet-ai-typing');
    const form = document.getElementById('kemet-ai-form');
    const input = document.getElementById('kemet-ai-input');
    const fab = document.getElementById('kemet-ai-fab');
    const closeBtn = document.getElementById('kemet-ai-close');
    const clearBtn = document.getElementById('kemet-ai-clear');

    const user = getSessionUser();
    const userId = user?.userId || '';
    const currentUserId = userId;
    const userToken = user?.token || user?.userId || '';
    const chatHeaders = userId
      ? {
          Authorization: `Bearer ${userToken}`,
          'x-user-id': userId,
        }
      : {};
    const fromStorage = getState(CHAT_STORAGE_KEY, []);
    const hasArabicChars = (text) => /[\u0600-\u06FF]/.test(String(text || ''));
    const state = {
      messages: Array.isArray(fromStorage) ? fromStorage.slice(-CHAT_MEMORY_LIMIT) : [],
      loading: false,
      open: false,
      historyLoaded: false,
    };

    if (!state.messages.length) {
      state.messages.push({
        role: 'assistant',
        content: 'أهلاً بيك في Kemet Travel. تحب أرشحلك رحلة مناسبة ولا نبني خطة على حسب مدينتك المفضلة؟',
      });
    }

    const saveMemory = () => {
      const short = state.messages.slice(-CHAT_MEMORY_LIMIT);
      setState(CHAT_STORAGE_KEY, short);
    };

    const render = () => {
      if (!body) return;
      body.innerHTML = state.messages
        .slice(-CHAT_MEMORY_LIMIT)
        .map(
          (msg) => {
            const content = String(msg.content || '');
            const rendered =
              msg.role === 'assistant' ? markdownToHtml(content) : escapeHtml(content).replace(/\n/g, '<br>');
            return `<div class="kemet-ai-msg ${msg.role === 'user' ? 'user' : 'assistant'} ${
              hasArabicChars(content) ? 'rtl' : 'ltr'
            }">${rendered}</div>`;
          }
        )
        .join('');
      body.scrollTop = body.scrollHeight;
      if (typing) typing.style.display = state.loading ? 'block' : 'none';
    };

    const setOpen = (open) => {
      state.open = !!open;
      panel?.classList.toggle('open', state.open);
      if (fab) fab.style.display = state.open ? 'none' : 'flex';
      if (state.open) setTimeout(() => input?.focus(), 50);
      render();
    };

    const loadHistory = async () => {
      if (!userId || state.historyLoaded) return;
      try {
        const data = await api(`/api/chat/history/${encodeURIComponent(userId)}`, {
          headers: chatHeaders,
        });
        const messages = Array.isArray(data?.messages) ? data.messages : [];
        if (messages.length) {
          state.messages = messages
            .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
            .map((m) => ({ role: m.role, content: String(m.content || '') }))
            .slice(-CHAT_MEMORY_LIMIT);
          saveMemory();
        }
      } catch {
        // keep local memory as fallback
      } finally {
        state.historyLoaded = true;
        render();
      }
    };

    const sendMessage = async (text) => {
      const message = String(text || '').trim();
      if (!message || state.loading) return;

      if (!userId) {
        showToast('Please login to use personalized Kemet Assistant.');
        return;
      }

      state.messages.push({ role: 'user', content: message });
      state.messages = state.messages.slice(-CHAT_MEMORY_LIMIT);
      state.loading = true;
      render();
      saveMemory();

      try {
        const messageText = String(text || '').trim();
        const history = state.messages.slice(0, -1).slice(-CHAT_MEMORY_LIMIT);
        const fallbackUserId = localStorage.getItem('userId') || 'guest_user';
        const chatPath = `/api/chat?userId=${encodeURIComponent(fallbackUserId)}&message=${encodeURIComponent(messageText)}`;
        const data = await api(chatPath, {
          method: 'POST',
          headers: chatHeaders,
          body: JSON.stringify({
            userId: fallbackUserId,
            message: messageText
          }),
        });
        const reply = String(data?.reply || data?.message || '').trim() || 'محتاج ثانيه وأرجعلك بإجابة أدق.';
        state.messages.push({ role: 'assistant', content: reply });
        state.messages = state.messages.slice(-CHAT_MEMORY_LIMIT);
      } catch (err) {
        const errorText = String(err?.message || '').toLowerCase();
        const friendlyMessage =
          errorText.includes('openai_api_key')
            ? 'الخدمة مش مفعلة حاليًا: مفتاح OpenAI غير موجود في السيرفر.'
            : errorText.includes('request failed: 429')
            ? 'في ضغط كبير حاليًا على الخدمة. جرب تاني بعد دقيقة.'
            : 'حصلت مشكلة مؤقتة في الاتصال. جرّب تاني بعد لحظة.';
        state.messages.push({
          role: 'assistant',
          content: friendlyMessage,
        });
        showToast(err.message || 'Assistant is unavailable');
      } finally {
        state.loading = false;
        render();
        saveMemory();
      }
    };

    fab?.addEventListener('click', async () => {
      setOpen(true);
      await loadHistory();
    });
    closeBtn?.addEventListener('click', () => setOpen(false));
    clearBtn?.addEventListener('click', async () => {
      if (!userId) return;
      try {
        await api(`/api/chat/history/${encodeURIComponent(userId)}`, {
          method: 'DELETE',
          headers: chatHeaders,
        });
        state.messages = [
          {
            role: 'assistant',
            content: 'تم مسح المحادثة. جاهز نبدأ من جديد.',
          },
        ];
        saveMemory();
        render();
      } catch (err) {
        showToast(err.message || 'Failed to clear chat.');
      }
    });
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = String(input?.value || '').trim();
      if (!val) return;
      if (input) input.value = '';
      await sendMessage(val);
    });

    render();
    loadHistory();
  }

  async function api(path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const cacheBuster = method === 'GET' ? `${path.includes('?') ? '&' : '?'}_t=${Date.now()}` : '';
    const mergedHeaders = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    showGlobalLoader();
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: mergedHeaders,
        method,
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || `Request failed: ${response.status}`);
      }

      return data;
    } finally {
      hideGlobalLoader();
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function markdownToHtml(markdown) {
    const text = String(markdown || '');
    let html = escapeHtml(text);

    html = html.replace(/^###\s(.+)$/gm, '<h4 style="margin:0 0 8px;font-weight:700;">$1</h4>');
    html = html.replace(/^##\s(.+)$/gm, '<h3 style="margin:0 0 8px;font-weight:700;">$1</h3>');
    html = html.replace(/^#\s(.+)$/gm, '<h2 style="margin:0 0 8px;font-weight:700;">$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/(?:^|\n)-\s(.+)(?=\n|$)/g, '$1<br>');
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function formatMoney(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '$0';
    return `$${amount.toLocaleString('en-US')}`;
  }

  function resolveImageUrl(rawUrl) {
    const url = String(rawUrl || '').trim();
    if (!url) return IMAGE_PLACEHOLDER;

    if (/^https?:\/\//i.test(url)) {
      if (/images\.unsplash\.com/i.test(url)) {
        const hasQuery = url.includes('?');
        return `${url}${hasQuery ? '&' : '?'}auto=format&fit=crop&w=1600&q=80`;
      }
      return url;
    }
    if (/^data:image\//i.test(url)) return url;

    const normalized = url.replace(/\\/g, '/');
    const filename = normalized.split('/').pop()?.toLowerCase() || '';

    if (PLACE_IMAGE_NAME_MAP[filename]) {
      return PLACE_IMAGE_NAME_MAP[filename];
    }

    if (normalized.startsWith('/')) return `${API_BASE_URL}${normalized}`;
    if (normalized.startsWith('./')) return `${API_BASE_URL}/${normalized.slice(2)}`;
    if (normalized.startsWith('Fronted/')) return `${API_BASE_URL}/${normalized.slice('Fronted/'.length)}`;
    if (normalized.startsWith('uploads/') || normalized.startsWith('images/')) {
      return `${API_BASE_URL}/${normalized}`;
    }

    return `${API_BASE_URL}/${normalized}`;
  }

  function getPlaceImageFallback(placeLike) {
    const key = normalizeText(placeLike?.name || placeLike?.title || '');
    return PLACE_IMAGE_TITLE_MAP[key] || IMAGE_PLACEHOLDER;
  }

  function getTripDisplayImage(trip) {
    const fromArray = Array.isArray(trip?.images) && trip.images.length ? trip.images[0] : '';
    const fromImage = trip?.image || '';
    const raw = String(fromArray || fromImage || '').trim();

    if (raw && !/via\.placeholder\.com/i.test(raw) && !/placeholder\.com/i.test(raw)) {
      return resolveImageUrl(raw);
    }

    const byTitle = TRIP_IMAGE_TITLE_MAP[normalizeText(trip?.title || '')];
    return byTitle || IMAGE_PLACEHOLDER;
  }

  function getTripDateLabel(trip, payment) {
    const fromTrip =
      trip?.dateRange ||
      trip?.dates ||
      trip?.scheduleDate ||
      (trip?.startDate && trip?.endDate ? `${trip.startDate} - ${trip.endDate}` : '') ||
      '';
    if (String(fromTrip).trim()) return String(fromTrip).trim();
    if (payment?.paidAt) return new Date(payment.paidAt).toLocaleDateString();
    return 'Date not specified';
  }

  function isPlaceholderLikeImage(url) {
    const value = String(url || '').toLowerCase();
    return !value || value.includes('via.placeholder.com') || value.includes('placeholder.com') || value.includes('placehold.co');
  }

  function applyImageFallbacks(root = document) {
    root.querySelectorAll('img').forEach((img) => {
      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
      if (img.dataset.fallbackBound === '1') return;
      img.dataset.fallbackBound = '1';
      img.addEventListener('error', () => {
        const secondary = String(img.dataset.fallbackSrc || '').trim();
        if (secondary && img.dataset.secondaryTried !== '1') {
          img.dataset.secondaryTried = '1';
          img.src = secondary;
          return;
        }
        if (img.dataset.fallbackApplied === '1') return;
        img.dataset.fallbackApplied = '1';
        img.src = IMAGE_PLACEHOLDER;
      });
    });
  }

  function toPlanTripFromHotel(hotel, nights = 1) {
    const city = getHotelCityName(hotel) || 'Egypt';
    const pricePerNight = Number(hotel.pricePerNight ?? hotel.price) || 0;
    const totalPrice = pricePerNight * nights;
    return {
      _id: `hotel-${hotel._id}`,
      title: hotel.name || hotel.title || 'Hotel Stay',
      location: city,
      duration: `${nights} ${nights === 1 ? 'night' : 'nights'}`,
      price: totalPrice,
      pricePerNight: pricePerNight,
      nights: nights,
      description: hotel.description || '',
      image: Array.isArray(hotel.images) ? hotel.images[0] : '',
      source: 'hotel',
      hotelId: hotel._id,
    };
  }

  function getHotelCityName(hotel) {
    const loc = hotel?.location;
    if (loc && typeof loc === 'object') {
      return String(loc.city || loc.region || loc.address || '').trim();
    }
    const str = String(loc || '').trim();
    if (!str) return '';
    return str.split(',')[0].trim();
  }

  function getHotelLocationLabel(hotel) {
    const loc = hotel?.location;
    if (loc && typeof loc === 'object') {
      const city = String(loc.city || '').trim();
      const address = String(loc.address || '').trim();
      if (city && address) return `${city}, ${address}`;
      return city || address || 'Egypt';
    }
    return String(loc || 'Egypt').trim();
  }

  function addTripToPlan(trip) {
    if (!isAuthenticated()) {
      showToast('Please login first to add items to your trip.');
      setTimeout(() => navigate(routes.login), 1200);
      return false;
    }
    if (!trip?._id) return false;
    const list = getState(PLAN_KEY, []);
    const tripName = String(trip.tripName || getState(TRIP_PLAN_SELECTED_KEY, '') || '').trim();
    const targetDay = Math.max(1, Number(trip.targetDay || 1) || 1);
    if (
      list.some(
        (t) =>
          String(t._id) === String(trip._id) &&
          String(t.tripName || '') === tripName &&
          Number(t.targetDay || 1) === targetDay
      )
    ) {
      return false;
    }
    list.push({ ...trip, tripName, targetDay });
    setState(PLAN_KEY, list);
    if (tripName) addTripName(tripName);
    return true;
  }

  function getTripNames() {
    const list = getState(TRIP_CATALOG_KEY, []);
    return Array.isArray(list) ? list.filter(Boolean).map((name) => String(name).trim()).filter(Boolean) : [];
  }

  function addTripName(name) {
    const clean = String(name || '').trim();
    if (!clean) return;
    const current = getTripNames();
    if (current.some((n) => normalizeText(n) === normalizeText(clean))) return;
    setState(TRIP_CATALOG_KEY, [...current, clean]);
    setTripMeta(clean, { status: getTripMeta(clean).status || 'Draft', userCreated: true });
  }

  function normalizeDayNumber(value, fallback = 1) {
    const number = Math.max(1, Number(value || 0) || 0);
    return number || fallback;
  }

  async function askTripNameAndDay(defaultDay = 1) {
    // Require login before adding anything to a trip
    if (!isAuthenticated()) {
      showToast('Please login first to add items to your trip.');
      setTimeout(() => navigate(routes.login), 1200);
      return null;
    }

    let tripNames = getTripNames();
    let selectedTrip = String(getState(TRIP_PLAN_SELECTED_KEY, '') || '').trim();

    if (!tripNames.length) {
      const firstTripName = await askTripSelectModal({ title: 'Create Your First Trip', allowCreate: true });
      if (!firstTripName || !String(firstTripName).trim()) return null;
      selectedTrip = String(firstTripName).trim();
      addTripName(selectedTrip);
      setState(TRIP_PLAN_SELECTED_KEY, selectedTrip);
      tripNames = getTripNames();
    }

    const picked = await askTripSelectModal({ title: 'Select Trip' });
    if (!picked || !String(picked).trim()) return null;
    const rawPicked = String(picked).trim();
    if (tripNames.includes(rawPicked)) {
      selectedTrip = rawPicked;
    } else {
      selectedTrip = rawPicked;
      addTripName(selectedTrip);
      tripNames = getTripNames();
    }

    const selectedMeta = getTripMeta(selectedTrip);
    if (selectedMeta?.status === 'Paid') {
      showError(`"${selectedTrip}" is already paid. You cannot add new activities.`);
      return null;
    }

    const dayInput = await askInputModal({
      title: 'Target Day',
      label: `Which day in this trip?`,
      defaultValue: String(defaultDay),
      type: 'number',
    });
    if (dayInput === null) return null;
    const targetDay = normalizeDayNumber(dayInput, defaultDay);
    setState(TRIP_PLAN_SELECTED_KEY, selectedTrip);
    return { tripName: selectedTrip, targetDay };
  }

  function getActiveTripName() {
    const selected = String(getState(TRIP_PLAN_SELECTED_KEY, '') || '').trim();
    if (selected) return selected;
    const names = getTripNames();
    return names[0] || '';
  }

  function getTripDatesMap() {
    const map = getState(TRIP_DATES_KEY, {});
    return map && typeof map === 'object' ? map : {};
  }

  function setTripDate(tripName, isoDate) {
    const key = normalizeText(tripName);
    if (!key) return;
    const map = getTripDatesMap();
    map[key] = String(isoDate || '');
    setState(TRIP_DATES_KEY, map);
  }

  function getTripDate(tripName) {
    const map = getTripDatesMap();
    return map[normalizeText(tripName)] || '';
  }

  function getTripMetaMap() {
    const map = getState(TRIP_META_KEY, {});
    return map && typeof map === 'object' ? map : {};
  }

  function setTripMeta(tripName, meta) {
    const key = normalizeText(tripName);
    if (!key) return;
    const current = getTripMetaMap();
    current[key] = { ...(current[key] || {}), ...(meta || {}) };
    setState(TRIP_META_KEY, current);
  }

  function getTripMeta(tripName) {
    const key = normalizeText(tripName);
    if (!key) return {};
    return getTripMetaMap()[key] || {};
  }

  function getPlanTripsForActiveTrip() {
    const activeTripName = getActiveTripName();
    const list = getPlanTrips();
    if (!activeTripName) return list;
    return list.filter((item) => normalizeText(item.tripName) === normalizeText(activeTripName));
  }

  function removePlanEntry(entryId) {
    const next = getPlanTrips().filter((item) => String(item.entryId || item._id) !== String(entryId));
    setState(PLAN_KEY, next);
  }

  async function addTripToPlanWithSelection(baseTrip, defaultDay = 1) {
    const selection = await askTripNameAndDay(defaultDay);
    if (!selection) return { added: false, cancelled: true };
    const entry = {
      ...baseTrip,
      entryId: `${baseTrip._id}-${selection.tripName}-${selection.targetDay}`,
      tripName: selection.tripName,
      targetDay: selection.targetDay,
    };
    const added = addTripToPlan(entry);
    return { added, cancelled: false, selection };
  }

  function getPlanTrips() {
    const list = getState(PLAN_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function removeTripFromPlan(tripId) {
    const next = getPlanTrips().filter((t) => String(t._id) !== String(tripId));
    setState(PLAN_KEY, next);
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function getSavedDestinations() {
    const list = getState(SAVED_DESTINATIONS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function setSavedDestinations(list) {
    setState(SAVED_DESTINATIONS_KEY, Array.isArray(list) ? list : []);
  }

  function isDestinationSaved(savedId) {
    return getSavedDestinations().some((item) => String(item.savedId) === String(savedId));
  }

  function toggleSavedDestination(item) {
    if (!item?.savedId) return false;
    const current = getSavedDestinations();
    const exists = current.some((entry) => String(entry.savedId) === String(item.savedId));
    if (exists) {
      setSavedDestinations(current.filter((entry) => String(entry.savedId) !== String(item.savedId)));
      return false;
    }
    setSavedDestinations([item, ...current]);
    return true;
  }

  function setBookmarkVisual(button, isSaved) {
    if (!button) return;
    const icon = button.querySelector('span[data-icon="bookmark"]');
    if (!icon) return;

    icon.style.fontVariationSettings = isSaved
      ? "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24"
      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";

    button.classList.toggle('text-[#C5A059]', isSaved);
    button.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    button.title = isSaved ? 'Remove from saved' : 'Save destination';
  }

  function bindSavedToggleButton(button, item) {
    if (!button || !item?.savedId) return;
    setBookmarkVisual(button, isDestinationSaved(item.savedId));
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const saved = toggleSavedDestination(item);
      setBookmarkVisual(button, saved);
      showToast(saved ? 'Saved successfully.' : 'Removed from saved.');
    });
  }

  function buildSavedItemFromExploreArticle(article) {
    const title = article.querySelector('h2')?.textContent?.trim() || 'Destination';
    const description = article.querySelector('p')?.textContent?.trim() || '';
    const image = article.querySelector('img')?.getAttribute('src') || '';
    const rating = article.querySelector('.absolute.top-4.right-4 .text-sm')?.textContent?.trim() || '';
    return {
      savedId: `explore-${slugify(title)}`,
      title,
      subtitle: description,
      priceText: '',
      ratingText: rating,
      image: resolveImageUrl(image),
      source: 'explore',
    };
  }

  function buildSavedItemFromHotel(hotel) {
    const title = hotel.name || hotel.title || 'Hotel';
    const city = getHotelCityName(hotel) || 'Egypt';
    const image = Array.isArray(hotel.images) && hotel.images.length ? hotel.images[0] : '';
    return {
      savedId: `hotel-${hotel._id || slugify(title)}`,
      title,
      subtitle: city,
      priceText: `${formatMoney(hotel.pricePerNight ?? hotel.price)}/night`,
      ratingText: Number.isFinite(Number(hotel.userRating ?? hotel.rating))
        ? Number(hotel.userRating ?? hotel.rating).toFixed(1)
        : '',
      image: resolveImageUrl(image),
      source: 'hotels',
      hotelId: hotel._id || '',
    };
  }

  function renderSavedDestinationsSection() {
    const savedSection = Array.from(document.querySelectorAll('section')).find((section) =>
      normalizeText(section.querySelector('h2')?.textContent || '').includes('saved destinations')
    );
    if (!savedSection) return;
    savedSection.id = 'saved-destinations-section';

    const grid = savedSection.querySelector('.grid');
    if (!grid) return;

    const saved = getSavedDestinations();
    if (!saved.length) {
      grid.innerHTML = `
        <div class="col-span-full bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 text-on-surface-variant text-sm">
          No saved destinations yet. Use the bookmark icon from Explore or Hotels.
        </div>
      `;
      return;
    }

    grid.innerHTML = saved
      .map(
        (item) => `
          <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden group">
            <div class="h-48 relative overflow-hidden">
              <img alt="${escapeHtml(item.title || 'Saved destination')}" class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" src="${escapeHtml(resolveImageUrl(item.image))}"/>
              <button data-remove-saved="${escapeHtml(item.savedId)}" class="absolute top-4 right-4 h-10 w-10 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-[#C5A059] active:scale-90 transition-all">
                <span class="material-symbols-outlined" data-icon="bookmark" style="font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;">bookmark</span>
              </button>
            </div>
            <div class="p-4">
              <h4 class="font-label-lg text-on-surface">${escapeHtml(item.title || 'Destination')}</h4>
              <p class="text-label-sm text-on-surface-variant">${escapeHtml(item.subtitle || '')}</p>
              <div class="flex items-center gap-2 mt-3">
                ${
                  item.ratingText
                    ? `<span class="bg-secondary-container/30 text-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Rating ${escapeHtml(item.ratingText)}</span>`
                    : ''
                }
                ${
                  item.priceText
                    ? `<span class="text-label-sm text-tertiary font-semibold">${escapeHtml(item.priceText)}</span>`
                    : ''
                }
              </div>
            </div>
          </div>
        `
      )
      .join('');

    grid.querySelectorAll('[data-remove-saved]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const savedId = btn.getAttribute('data-remove-saved');
        setSavedDestinations(getSavedDestinations().filter((item) => String(item.savedId) !== String(savedId)));
        showToast('Removed from saved.');
        renderSavedDestinationsSection();
      });
    });

    applyImageFallbacks(grid);
  }

  function scrollToSavedDestinations() {
    const section = document.getElementById('saved-destinations-section');
    if (!section) return false;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  function standardizeHeader() {
    const first = Array.from(document.body.children).find((el) => el.matches('header, nav'));
    if (!first) return;

    const auth = isAuthenticated();
    first.outerHTML = `
      <header class="bg-[#FDFCFB] border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <nav class="max-w-7xl mx-auto grid grid-cols-3 items-center px-8 py-5">
          <a class="text-2xl font-serif italic justify-self-start" href="${routes.home}">Kemet Travel</a>
          <div class="hidden md:flex items-center justify-center gap-6 text-sm font-serif">
            <a class="transition-all hover:text-primary hover:-translate-y-0.5" href="${routes.explore}">Explore</a>
            <a class="transition-all hover:text-primary hover:-translate-y-0.5" href="${routes.myTrip}">My Trip</a>
            <a class="transition-all hover:text-primary hover:-translate-y-0.5" href="${routes.trips}">Trips</a>
          </div>
          <div class="hidden md:flex items-center justify-end gap-6 text-sm font-serif">
            ${auth ? `<a class="transition-all hover:text-primary hover:-translate-y-0.5" href="${routes.dashboard}">Dashboard</a>` : `<a class="px-3 py-1.5 rounded-full border border-outline-variant transition-all hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-0.5" href="${routes.login}">Login</a> <a class="px-3 py-1.5 rounded-full border border-outline-variant transition-all hover:bg-[#775A19] hover:text-white hover:border-[#775A19] hover:-translate-y-0.5" href="${routes.signup}">Sign Up</a>`}
            ${auth ? '<button id="logout-btn" class="text-stone-500">Logout</button>' : ''}
          </div>
          <button class="mobile-menu-btn md:hidden justify-self-end" id="mobile-menu-btn" aria-label="Open menu">
            <span class="material-symbols-outlined" data-icon="menu">menu</span>
          </button>
        </nav>
      </header>
      <div class="mobile-menu-overlay" id="mobile-menu-overlay"></div>
      <div class="mobile-menu-panel" id="mobile-menu-panel">
        <div class="mobile-menu-header">
          <span class="logo">Kemet Travel</span>
          <button class="mobile-menu-close" id="mobile-menu-close" aria-label="Close menu">
            <span class="material-symbols-outlined" data-icon="close">close</span>
          </button>
        </div>
        <nav class="mobile-menu-nav">
          <a href="${routes.explore}">Explore</a>
          <a href="${routes.myTrip}">My Trip</a>
          <a href="${routes.trips}">Trips</a>
          ${auth ? `<a href="${routes.dashboard}">Dashboard</a>` : ''}
        </nav>
        <div class="mobile-menu-footer">
          ${auth
            ? '<button id="mobile-logout-btn" class="logout-btn">Logout</button>'
            : '<a href="' + routes.login + '" class="login-btn">Login</a><a href="' + routes.signup + '" class="signup-btn">Sign Up</a>'
          }
        </div>
      </div>
    `;

    const menuBtn = document.getElementById('mobile-menu-btn');
    const menuPanel = document.getElementById('mobile-menu-panel');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const menuClose = document.getElementById('mobile-menu-close');

    function openMobileMenu() {
      menuPanel?.classList.add('open');
      menuOverlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      menuPanel?.classList.remove('open');
      menuOverlay?.classList.remove('open');
      document.body.style.overflow = '';
    }

    menuBtn?.addEventListener('click', openMobileMenu);
    menuClose?.addEventListener('click', closeMobileMenu);
    menuOverlay?.addEventListener('click', closeMobileMenu);

    document.getElementById('mobile-logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      clearSession();
      showToast('Logged out.');
      navigate(routes.home);
    });

    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      showToast('Logged out.');
      navigate(routes.home);
    });

    // Highlight active nav link
    const currentPage = window.location.pathname.split('/').pop();
    menuPanel?.querySelectorAll('a').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }

  function adjustTopSpacing() {
    const main = document.querySelector('main');
    if (!main) return;
    if (page === routes.tripDetails) {
      main.classList.remove('pt-[72px]');
      main.classList.add('pt-10');
    }
  }

  function wireForms() {
    const form = document.querySelector('form');
    if (!form) return;

    if (page === routes.signup) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = form.querySelector('input[name="name"], input#name, input[type="text"]')?.value?.trim();
        const email = form.querySelector('input[name="email"], input#email, input[type="email"]')?.value?.trim();
        const password = form.querySelector('input[name="password"], input#password, input[type="password"]')?.value;
        const confirm = form.querySelector('input[name="confirm-password"], input#confirm-password')?.value;

        if (!name || !email || !password) return showToast('Please fill all required fields.');
        if (confirm !== undefined && confirm !== password) return showToast('Passwords do not match.');

        try {
          const data = await api('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
          });
          const user = normalizeUser(data.user);
          if (user) {
            setState(SESSION_KEY, user);
            localStorage.setItem('userId', String(user.userId || user.id || ''));
          }
          showSuccess('Account created successfully.');
          navigate(routes.dashboard);
        } catch (err) {
          showError(err.message);
        }
      });

      findLinkByText('sign in')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(routes.login);
      });
    }

    if (page === routes.login) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[name="email"], input#email, input[type="email"]')?.value?.trim();
        const password = form.querySelector('input[name="password"], input#password, input[type="password"]')?.value;

        if (!email || !password) return showToast('Enter email and password.');

        try {
          const data = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          const user = normalizeUser(data.user);
          if (!user) throw new Error('Invalid session data from server');
          setState(SESSION_KEY, user);
          localStorage.setItem('userId', String(user.userId || user.id || ''));
          showSuccess('Welcome back.');
          navigate(routes.dashboard);
        } catch (err) {
          showError(err.message);
        }
      });

      findLinkByText('create account')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(routes.signup);
      });

      findLinkByText('forgot')?.addEventListener('click', async (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('input[name="email"], input#email, input[type="email"]');
        const typedEmail = String(emailInput?.value || '').trim();
        const email = (typedEmail ||
          (await askInputModal({
            title: 'Reset Password',
            label: 'Enter your account email to receive OTP.',
            type: 'email',
            placeholder: 'you@example.com',
          })) ||
          ''
        ).trim();

        if (!email) {
          showError('Email is required.');
          return;
        }

        try {
          await api('/api/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
          });

          const otpInput =
            (await askInputModal({
              title: 'OTP Verification',
              label: `Enter the OTP sent to ${email}`,
              placeholder: '6-digit code',
            })) || '';
          if (!otpInput) {
            showError('OTP is required.');
            return;
          }

          const newPassword =
            (await askInputModal({
              title: 'Set New Password',
              label: 'Enter your new password (minimum 6 characters).',
              type: 'password',
            })) || '';
          if (!newPassword || newPassword.length < 6) {
            showError('Password must be at least 6 characters.');
            return;
          }

          const confirmPassword =
            (await askInputModal({
              title: 'Confirm Password',
              label: 'Please confirm your new password.',
              type: 'password',
            })) || '';
          if (newPassword !== confirmPassword) {
            showError('Passwords do not match.');
            return;
          }

          await api('/api/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
              email,
              otp: otpInput,
              newPassword,
            }),
          });

          if (emailInput) emailInput.value = email;
          showSuccess('Password updated successfully. You can login now.');
        } catch (err) {
          showError(err?.message || 'Could not reset password right now.');
        }
      });
    }
  }

  async function wireTripsPage() {
    const grid = document.querySelector('section .grid');
    if (!grid) return;
    const params = new URLSearchParams(window.location.search);
    const initialCity = String(params.get('city') || '').trim();

    try {
      const trips = await api('/api/trips');
      if (!Array.isArray(trips) || !trips.length) {
        grid.innerHTML = '<p class="col-span-full text-center py-16 text-stone-500">No trips available.</p>';
        return;
      }

      const filterBar = Array.from(document.querySelectorAll('section')).find((section) =>
        section.querySelector('button span[data-icon="filter_list"]')
      );
      const filterSelects = filterBar ? Array.from(filterBar.querySelectorAll('select')) : [];
      const durationSelect = filterSelects[0] || null;
      const budgetSelect = filterSelects[1] || null;
      const citySelect = filterSelects[2] || null;
      const applyBtn = findButtonByText('apply filters', filterBar || document);

      const egyptCities = [
        'Cairo',
        'Giza',
        'Alexandria',
        'Luxor',
        'Aswan',
        'Hurghada',
        'Sharm El Sheikh',
        'Dahab',
        'Marsa Alam',
        'Fayoum',
        'Ismailia',
        'Port Said',
        'Suez',
        'Mansoura',
        'Tanta',
        'Assiut',
        'Sohag',
        'Minya',
        'Beni Suef',
        'Qena',
        'Asyut',
        'Damietta',
        'Zagazig',
        'Kafr El Sheikh',
        'Matrouh',
        'Siwa',
        'Sinai',
        'Red Sea',
        'Nuweiba',
        'Taba',
      ];

      const splitLocationTokens = (locationText) =>
        String(locationText || '')
          .split(/[-,&/|]/g)
          .map((part) => String(part || '').trim())
          .filter(Boolean);

      const detectTripDays = (trip) => {
        const durationText = normalizeText(trip?.duration || '');
        const dayMatch = durationText.match(/(\d+)\s*day/);
        if (dayMatch) return Number(dayMatch[1]);
        const nightMatch = durationText.match(/(\d+)\s*night/);
        if (nightMatch) return Number(nightMatch[1]) + 1;
        const hourMatch = durationText.match(/(\d+)\s*hour/);
        if (hourMatch) {
          const hours = Number(hourMatch[1]);
          return Math.max(1, Math.ceil(hours / 24));
        }
        return null;
      };

      const classifyBudgetTier = (tripPrice) => {
        const price = Number(tripPrice || 0);
        if (price <= 1500) return 'essential';
        if (price <= 3000) return 'boutique';
        return 'luxury';
      };

      const allCities = Array.from(
        new Set([
          ...egyptCities,
          ...trips.flatMap((trip) => splitLocationTokens(trip.location)),
        ])
      ).sort((a, b) => String(a).localeCompare(String(b), 'en', { sensitivity: 'base' }));

      if (citySelect) {
        const current = normalizeText(citySelect.value || '');
        citySelect.innerHTML = [
          '<option value="all">All Egypt Cities</option>',
          ...allCities.map((city) => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`),
        ].join('');
        if (current && current !== 'all regions' && current !== 'all') {
          const matched = allCities.find((city) => normalizeText(city) === current);
          if (matched) citySelect.value = matched;
        }
        if (initialCity) {
          const matched =
            allCities.find((city) => normalizeText(city) === normalizeText(initialCity)) ||
            allCities.find((city) => normalizeText(city).includes(normalizeText(initialCity)));
          if (matched) citySelect.value = matched;
        }
      }

      const renderTrips = (list) => {
        grid.innerHTML = '';
        if (!list.length) {
          grid.innerHTML = `
            <div class="col-span-full text-center py-16 text-stone-500">
              No trips match current filters.
            </div>
          `;
          return;
        }

        list.forEach((trip) => {
          const tripPrice = Number(trip.price || 0);
          const card = document.createElement('div');
          card.className = 'group bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer';
          card.innerHTML = `
            <div class="relative h-64 overflow-hidden">
              <img alt="${escapeHtml(trip.title || 'Trip')}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${escapeHtml(getTripDisplayImage(trip))}"/>
              <div class="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-widest">${trip.duration || 'Flexible'}</div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-serif mb-2 text-stone-900">${escapeHtml(trip.title || 'Untitled Trip')}</h3>
              <p class="text-stone-500 text-sm mb-4">${escapeHtml(trip.location || '')}</p>
              <div class="flex items-end justify-between pt-4 border-t border-stone-100">
                <div>
                  <span class="text-[10px] text-stone-400 block uppercase tracking-tighter">Starting from</span>
                  <span class="text-2xl font-bold text-[#775a19]">${formatMoney(tripPrice)}</span>
                </div>
                <a href="${routes.tripDetails}?id=${encodeURIComponent(trip._id)}" class="trip-details-btn bg-[#775a19] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#5e4714] inline-flex items-center">Details</a>
              </div>
            </div>
          `;

          card.addEventListener('click', () => {
            setState(SELECTED_TRIP_KEY, trip);
            navigate(`${routes.tripDetails}?id=${encodeURIComponent(trip._id)}`);
          });

          card.querySelector('.trip-details-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setState(SELECTED_TRIP_KEY, trip);
            navigate(`${routes.tripDetails}?id=${encodeURIComponent(trip._id)}`);
          });

          grid.appendChild(card);
        });
      };

      const applyFilters = () => {
        const durationValue = normalizeText(durationSelect?.value || 'all durations');
        const budgetValue = normalizeText(budgetSelect?.value || 'all tiers');
        const cityValue = normalizeText(citySelect?.value || 'all');

        const filtered = trips.filter((trip) => {
          const tripDays = detectTripDays(trip);
          const tripBudgetTier = classifyBudgetTier(trip.price);
          const locationTokens = splitLocationTokens(trip.location).map((item) => normalizeText(item));

          const durationOk =
            durationValue.includes('all') ||
            !tripDays ||
            (durationValue.includes('3-5') && tripDays >= 3 && tripDays <= 5) ||
            (durationValue.includes('7-10') && tripDays >= 7 && tripDays <= 10) ||
            (durationValue.includes('14+') && tripDays >= 14);

          const budgetOk =
            budgetValue.includes('all') ||
            (budgetValue.includes('luxury') && tripBudgetTier === 'luxury') ||
            (budgetValue.includes('boutique') && tripBudgetTier === 'boutique') ||
            (budgetValue.includes('essential') && tripBudgetTier === 'essential');

          const cityOk =
            cityValue === 'all' ||
            cityValue.includes('all region') ||
            locationTokens.some((token) => token.includes(cityValue) || cityValue.includes(token));

          return durationOk && budgetOk && cityOk;
        });

        renderTrips(filtered);
      };

      renderTrips(trips);
      durationSelect?.addEventListener('change', applyFilters);
      budgetSelect?.addEventListener('change', applyFilters);
      citySelect?.addEventListener('change', applyFilters);
      applyBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        applyFilters();
      });
      // Apply incoming query filters immediately on first load (e.g. from index search/city chips).
      applyFilters();
    } catch (err) {
      showToast(err.message || 'Failed to load trips.');
    }
  }

  async function wireTripDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');
    let selectedTrip = getState(SELECTED_TRIP_KEY, null);
    const fallbackTripId = selectedTrip?._id ? String(selectedTrip._id) : null;
    const effectiveTripId = tripId || fallbackTripId;

    if (effectiveTripId) {
      try {
        selectedTrip = await api(`/api/trips/${encodeURIComponent(effectiveTripId)}`);
        setState(SELECTED_TRIP_KEY, selectedTrip);
      } catch (err) {
        if (!selectedTrip) {
          showToast(err.message || 'Failed to load trip details.');
          navigate(routes.trips);
          return;
        }
      }
    } else if (!selectedTrip) {
      showToast('Please open a trip from the Trips page.');
      navigate(routes.trips);
      return;
    }

    const title = selectedTrip.title || 'Trip Details';
    const description = selectedTrip.description || '';
    const location = selectedTrip.location || '';
    const duration = selectedTrip.duration || 'Flexible';
    const rating = Number.isFinite(Number(selectedTrip.rating)) ? Number(selectedTrip.rating).toFixed(1) : 'N/A';
    const tripPrice = Number(selectedTrip.price || 0);
    const tripCurrency = selectedTrip.currency || 'USD';
    const imageListRaw = [
      ...(Array.isArray(selectedTrip.images) ? selectedTrip.images : []),
      selectedTrip.image,
    ].filter(Boolean);
    const normalizedGallery = imageListRaw.map(resolveImageUrl).filter((src) => !isPlaceholderLikeImage(src));
    const gallery = normalizedGallery.length ? normalizedGallery : [getTripDisplayImage(selectedTrip)];

    const heroImage = document.querySelector('section.relative img');
    if (heroImage) heroImage.src = gallery[0];

    const heroMeta = document.querySelector('section.relative .flex.items-center.space-x-2');
    if (heroMeta) {
      heroMeta.innerHTML = `
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="font-label-caps text-label-caps">${escapeHtml(rating)} RATING</span>
        <span class="text-white/40">•</span>
        <span class="font-label-caps text-label-caps text-white">${escapeHtml(duration)}</span>
      `;
    }

    const heroTitle = document.querySelector('section.relative h1');
    if (heroTitle) heroTitle.textContent = title;

    const heroDesc = document.querySelector('section.relative p.font-body-lg');
    if (heroDesc) heroDesc.textContent = description || location;

    const heroSection = document.querySelector('section.relative');
    if (heroSection) {
      let galleryStrip = document.getElementById('trip-gallery-strip');
      if (!galleryStrip) {
        galleryStrip = document.createElement('div');
        galleryStrip.id = 'trip-gallery-strip';
        galleryStrip.className = 'absolute left-6 right-6 bottom-4 z-20 flex gap-3 overflow-x-auto scroll-hide';
        heroSection.appendChild(galleryStrip);
      }
      galleryStrip.innerHTML = gallery
        .map(
          (src, idx) =>
            `<button class="trip-thumb ${idx === 0 ? 'ring-2 ring-primary-container' : ''} rounded-lg overflow-hidden border border-white/40 shrink-0" data-src="${escapeHtml(src)}" style="width:96px;height:64px">
              <img src="${escapeHtml(src)}" class="w-full h-full object-cover" alt="Trip image ${idx + 1}">
            </button>`
        )
        .join('');
      galleryStrip.querySelectorAll('.trip-thumb').forEach((btn) => {
        btn.addEventListener('click', () => {
          const src = btn.getAttribute('data-src');
          if (heroImage && src) heroImage.src = src;
          galleryStrip.querySelectorAll('.trip-thumb').forEach((el) => el.classList.remove('ring-2', 'ring-primary-container'));
          btn.classList.add('ring-2', 'ring-primary-container');
        });
      });
    }

    const stickyBar = document.querySelector('.sticky.top-\\[72px\\]');
    const priceValueEl = stickyBar?.querySelector('.font-h3.text-h3.text-primary');
    if (priceValueEl) priceValueEl.textContent = formatMoney(tripPrice);

    const summaryNote = stickyBar?.querySelector('.font-body-md.text-stone-400');
    if (summaryNote) summaryNote.textContent = `/ ${tripCurrency}`;

    const itineraryHost = document.querySelector('section .space-y-0');
    const normalizeItineraryItems = (trip) => {
      const raw = Array.isArray(trip?.itinerary) ? trip.itinerary : [];
      const fromArray = raw
        .map((item) => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            return String(item.title || item.name || item.activity || item.description || '').trim();
          }
          return '';
        })
        .filter(Boolean);

      if (fromArray.length) return fromArray;

      const altText = String(trip?.itineraryText || trip?.program || trip?.schedule || '').trim();
      if (altText) {
        return altText
          .split(/\r?\n|[•\-–]\s+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const desc = String(trip?.description || '').trim();
      if (desc) {
        return desc
          .split('.')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 4);
      }

      return [];
    };
    const itineraryItems = normalizeItineraryItems(selectedTrip);
    if (itineraryHost) {
      if (!itineraryItems.length) {
        itineraryHost.innerHTML = `<div class="bg-white p-6 rounded-lg border border-stone-100 text-stone-500">Itinerary details will be updated soon.</div>`;
      } else {
        itineraryHost.innerHTML = itineraryItems
          .map(
            (item, idx) => `
            <div class="itinerary-step relative pb-6 flex gap-6">
              <div class="itinerary-line relative flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm z-10 relative">${idx + 1}</div>
              </div>
              <div class="flex-1 bg-white p-5 rounded-lg shadow-sm border border-stone-100">
                <h3 class="font-h3 text-[22px] text-stone-900 mb-2">Day ${idx + 1}</h3>
                <p class="font-body-md text-on-surface-variant">${escapeHtml(String(item))}</p>
              </div>
            </div>`
          )
          .join('');
      }
    }

    const includedList = document.querySelector('.bg-white.rounded-xl ul.space-y-4');
    const includedItems = Array.isArray(selectedTrip.includedServices)
      ? selectedTrip.includedServices.filter(Boolean)
      : Array.isArray(selectedTrip.included)
      ? selectedTrip.included.filter(Boolean)
      : [];
    if (includedList) {
      if (!includedItems.length) {
        includedList.className = 'space-y-0';
        includedList.innerHTML = `<li class="text-stone-500 text-sm">Contact us for inclusions details</li>`;
      } else {
        includedList.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';
        includedList.innerHTML = includedItems
          .map(
            (item) =>
              `<li class="flex items-start gap-2 p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm">
                <span class="material-symbols-outlined text-green-600" data-icon="check_circle" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                <span class="text-on-surface">${escapeHtml(String(item))}</span>
              </li>`
          )
          .join('');
      }
    }

    // Dynamic recommendations: show real trips from DB matching current trip location/city.
    const recommendationTitleEl = Array.from(document.querySelectorAll('section h2')).find((el) => {
      const txt = normalizeText(el.textContent || '');
      return txt.includes('luxury accommodations') || txt.includes('recommend');
    });
    const recommendationSection = recommendationTitleEl?.closest('section') || null;
    const recommendationGrid = recommendationSection?.querySelector('.grid') || null;
    const locationTokens = String(location || '')
      .split(/[^a-zA-Z0-9\u0600-\u06FF]+/)
      .map((x) => normalizeText(x))
      .filter(Boolean)
      .filter((x) => !['egypt', 'tour', 'trip'].includes(x));

    if (recommendationTitleEl && recommendationGrid) {
      try {
        const allTripsRaw = await api('/api/trips');
        const allTrips = Array.isArray(allTripsRaw) ? allTripsRaw : [];
        const currentId = String(selectedTrip?._id || '');

        const baseCity = normalizeText(String(location).split(/[,&/|-]/)[0] || '');
        const baseGovernorate = normalizeText(String(location).split(/[,&/|-]/)[1] || '');
        const scored = allTrips
          .filter((t) => t && String(t._id || '') !== currentId)
          .map((t) => {
            const candidateLoc = String(t.location || '').trim();
            const candidateTokens = candidateLoc
              .split(/[^a-zA-Z0-9\u0600-\u06FF]+/)
              .map((x) => normalizeText(x))
              .filter(Boolean);
            const candidateCity = normalizeText(String(candidateLoc).split(/[,&/|-]/)[0] || '');
            const candidateGovernorate = normalizeText(String(candidateLoc).split(/[,&/|-]/)[1] || '');
            const overlap = locationTokens.reduce(
              (acc, token) => (candidateTokens.some((ct) => ct.includes(token) || token.includes(ct)) ? acc + 1 : acc),
              0
            );
            const sameCity = baseCity && candidateCity && (candidateCity.includes(baseCity) || baseCity.includes(candidateCity)) ? 1 : 0;
            const sameGov =
              baseGovernorate && candidateGovernorate && (candidateGovernorate.includes(baseGovernorate) || baseGovernorate.includes(candidateGovernorate))
                ? 1
                : 0;
            const priceDistance = Math.abs(Number(t.price || 0) - Number(tripPrice || 0));
            return {
              trip: t,
              score: overlap,
              rating: Number(t.rating || 0),
              sameCity,
              sameGov,
              priceDistance,
            };
          })
          .filter((x) => x.score > 0 || x.sameCity || x.sameGov)
          .sort((a, b) =>
            b.sameCity - a.sameCity ||
            b.sameGov - a.sameGov ||
            b.score - a.score ||
            a.priceDistance - b.priceDistance ||
            b.rating - a.rating
          )
          .slice(0, 3)
          .map((x) => x.trip);

        if (scored.length) {
          const cityLabel = String(location || 'Same Area');
          recommendationTitleEl.textContent = `Recommended Trips in ${cityLabel}`;
          recommendationGrid.innerHTML = scored
            .map((t) => {
              const tTitle = String(t.title || 'Trip');
              const tLoc = String(t.location || 'Egypt');
              const tDesc = String(t.description || '').trim();
              const tPrice = Number(t.price || 0);
              const tImg = getTripDisplayImage(t);
              return `
                <article class="group cursor-pointer rounded-lg border border-stone-100 bg-white p-3 shadow-sm" data-rec-trip-id="${String(t._id || '')}">
                  <div class="overflow-hidden rounded-lg mb-3">
                    <img alt="${escapeHtml(tTitle)}" src="${escapeHtml(tImg)}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500">
                  </div>
                  <h4 class="font-h3 text-[20px] text-stone-900 mb-1">${escapeHtml(tTitle)}</h4>
                  <p class="font-label-caps text-[10px] text-primary-container uppercase tracking-tighter mb-2">${escapeHtml(tLoc)}</p>
                  <p class="font-body-md text-on-surface-variant text-sm mb-3">${escapeHtml(tDesc || 'Explore this curated Kemet journey.')}</p>
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-bold text-primary">${formatMoney(tPrice)}</span>
                    <a href="${routes.tripDetails}?id=${encodeURIComponent(String(t._id || ''))}" class="px-3 py-2 rounded-md border border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 transition-colors">View Details</a>
                  </div>
                </article>
              `;
            })
            .join('');
          recommendationGrid.querySelectorAll('[data-rec-trip-id]').forEach((card) => {
            card.addEventListener('click', (e) => {
              if (e.target.closest('a')) return;
              const tripId = card.getAttribute('data-rec-trip-id');
              const trip = scored.find((t) => String(t._id || '') === String(tripId));
              if (trip) setState(SELECTED_TRIP_KEY, trip);
              navigate(`${routes.tripDetails}?id=${encodeURIComponent(tripId)}`);
            });
          });
        } else if (allTrips.length) {
          // Always replace static block with DB trips even if strict match is empty.
          const fallbackTrips = allTrips.filter((t) => String(t?._id || '') !== currentId).slice(0, 3);
          recommendationTitleEl.textContent = 'Recommended Trips';
          recommendationGrid.innerHTML = fallbackTrips
            .map((t) => {
              const tTitle = String(t.title || 'Trip');
              const tLoc = String(t.location || 'Egypt');
              const tPrice = Number(t.price || 0);
              const tImg = getTripDisplayImage(t);
              return `
                <article class="group cursor-pointer rounded-lg border border-stone-100 bg-white p-3 shadow-sm" data-rec-trip-id="${String(t._id || '')}">
                  <div class="overflow-hidden rounded-lg mb-3">
                    <img alt="${escapeHtml(tTitle)}" src="${escapeHtml(tImg)}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500">
                  </div>
                  <h4 class="font-h3 text-[20px] text-stone-900 mb-1">${escapeHtml(tTitle)}</h4>
                  <p class="font-label-caps text-[10px] text-primary-container uppercase tracking-tighter mb-2">${escapeHtml(tLoc)}</p>
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-bold text-primary">${formatMoney(tPrice)}</span>
                    <a href="${routes.tripDetails}?id=${encodeURIComponent(String(t._id || ''))}" class="px-3 py-2 rounded-md border border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 transition-colors">View Details</a>
                  </div>
                </article>
              `;
            })
            .join('');
          recommendationGrid.querySelectorAll('[data-rec-trip-id]').forEach((card) => {
            card.addEventListener('click', (e) => {
              if (e.target.closest('a')) return;
              const tripId = card.getAttribute('data-rec-trip-id');
              const trip = fallbackTrips.find((t) => String(t._id || '') === String(tripId));
              if (trip) setState(SELECTED_TRIP_KEY, trip);
              navigate(`${routes.tripDetails}?id=${encodeURIComponent(tripId)}`);
            });
          });
        }
      } catch {
        // Keep existing static block if recommendations fail.
      }
    }

    // Dynamic map card on right side based on current trip location.
    const mapCard = Array.from(document.querySelectorAll('div.bg-surface-container.rounded-xl')).find((el) =>
      !!el.querySelector('img[data-location], img[alt*="Map"]')
    );
    if (mapCard) {
      const labelNodes = mapCard.querySelectorAll('.bg-white\\/90');
      const routeTextEl = mapCard.querySelector('p.font-label-caps');
      const mapImageEl = mapCard.querySelector('img[data-location], img[alt*="Map"]');
      const routeWords = String(location || '')
        .split(/[,&/|-]+/)
        .map((w) => w.trim())
        .filter(Boolean);
      const topLabels = routeWords.length ? routeWords : ['Egypt'];
      labelNodes.forEach((node, idx) => {
        if (topLabels[idx]) {
          node.textContent = topLabels[idx].toUpperCase();
          node.style.display = '';
        } else {
          node.style.display = 'none';
        }
      });
      if (routeTextEl) {
        routeTextEl.textContent = `Route: ${topLabels.join(' - ')}`;
      }
      if (mapImageEl) {
        mapImageEl.setAttribute('data-location', String(location || 'Egypt'));
      }
    }

    const saveTripBtn = findButtonByText('add to my trip');
    if (saveTripBtn) {
      saveTripBtn.textContent = 'Save';
      const tripSavedItem = {
        savedId: `trip-${selectedTrip._id || slugify(title)}`,
        title: title || 'Trip',
        subtitle: location || duration || 'Egypt',
        priceText: tripPrice ? formatMoney(tripPrice) : '',
        ratingText: rating || '',
        image: gallery[0] || '',
        source: 'trip',
        tripId: selectedTrip._id,
      };
      bindSavedToggleButton(saveTripBtn, tripSavedItem);
    }

    findButtonByText('book trip')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!selectedTrip?._id) return showToast('Please open this page from Trips list.');
      localStorage.removeItem('kemet-selected-day-payment');
      setState(BOOKING_MODE_KEY, 'trip');
      navigate(
        `${routes.booking}?tripId=${encodeURIComponent(selectedTrip._id)}&totalPrice=${encodeURIComponent(
          Number(selectedTrip.price || 0)
        )}`
      );
    });

    findButtonByText('contact concierge')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Support team is available from dashboard.');
    });

    const bookNowTop = findButtonByText('sign in');
    bookNowTop?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(isAuthenticated() ? routes.dashboard : routes.login);
    });
  }

  async function wireBookingPage() {
    const confirmBtn = findButtonByText('confirm') || findButtonByText('pay');
    if (!confirmBtn) return;

    const params = new URLSearchParams(window.location.search);
    const queryTripId = params.get('tripId') || params.get('triplId') || params.get('id');
    const queryTotalRaw = params.get('totalPrice') ?? params.get('total');
    const queryDayRaw = params.get('day');

    let selectedTrip = getState(SELECTED_TRIP_KEY, null);
    if (
      queryTripId &&
      (!selectedTrip || !selectedTrip._id || String(selectedTrip._id) !== String(queryTripId))
    ) {
      try {
        selectedTrip = await api(`/api/trips/${encodeURIComponent(queryTripId)}`);
        setState(SELECTED_TRIP_KEY, selectedTrip);
      } catch {
        selectedTrip = getState(SELECTED_TRIP_KEY, null);
      }
    }

    const selectedDayPayment = getState('kemet-selected-day-payment', null);
    const bookingMode = getState(BOOKING_MODE_KEY, '');
    const hasQueryTotal = queryTotalRaw !== null && queryTotalRaw !== undefined && queryTotalRaw !== '';
    const queryDay = queryDayRaw === null ? NaN : Number(queryDayRaw);
    const queryTotal = queryTotalRaw === null ? NaN : Number(queryTotalRaw);

    const candidateDayPayment =
      hasQueryTotal && Number.isFinite(queryTotal) && queryTotal >= 0
        ? { day: Number.isFinite(queryDay) ? queryDay : 1, total: queryTotal }
        : selectedDayPayment;

    const selectedDayTotal = Number(candidateDayPayment?.total);
    const hasSelectedDayPayment =
      Number.isFinite(selectedDayTotal) && selectedDayTotal >= 0 && (hasQueryTotal || bookingMode === 'day');
    const bookingTotal = hasSelectedDayPayment
      ? selectedDayTotal
      : Number.isFinite(Number(selectedTrip?.price))
      ? Number(selectedTrip.price)
      : 0;
    const bookingSummaryImageEl = document.getElementById('booking-summary-image');
    const bookingSummaryTitleEl = document.getElementById('booking-summary-title');
    const bookingSummaryBadgeEl = document.getElementById('booking-summary-duration-badge');
    const bookingSummaryDateEl = document.getElementById('booking-summary-date');
    const bookingSummaryTravelersEl = document.getElementById('booking-summary-travelers');
    const bookingSummaryLineLabelEl = document.getElementById('booking-summary-line-label');
    const plannedTripNames = getState(PAYMENT_TRIP_NAMES_KEY, []);
    const primaryPlannedTripName =
      Array.isArray(plannedTripNames) && plannedTripNames.length ? String(plannedTripNames[0] || '').trim() : '';
    const plannedEntries = primaryPlannedTripName
      ? getPlanTrips().filter((x) => normalizeText(x?.tripName) === normalizeText(primaryPlannedTripName))
      : [];
    const plannedFirstImage = plannedEntries[0]?.image ? resolveImageUrl(plannedEntries[0].image) : '';
    const plannedDateText = primaryPlannedTripName
      ? getTripDate(primaryPlannedTripName) || getTripMeta(primaryPlannedTripName).date || ''
      : '';
    const plannedLocationSummary = Array.from(
      new Set(
        plannedEntries
          .map((x) => String(x?.subtitle || x?.location || '').trim())
          .filter(Boolean)
      )
    )
      .slice(0, 2)
      .join(' • ');
    const summaryImageSource =
      hasSelectedDayPayment && plannedFirstImage ? plannedFirstImage : getTripDisplayImage(selectedTrip || {});
    const summaryTitleSource =
      hasSelectedDayPayment && primaryPlannedTripName ? primaryPlannedTripName : selectedTrip?.title || '';
    if (bookingSummaryImageEl) {
      bookingSummaryImageEl.src = summaryImageSource;
    }
    if (bookingSummaryTitleEl && summaryTitleSource) {
      bookingSummaryTitleEl.textContent = summaryTitleSource;
    }
    if (bookingSummaryBadgeEl) {
      bookingSummaryBadgeEl.textContent = String(
        hasSelectedDayPayment ? `Day ${Number(candidateDayPayment?.day || 1)} Plan` : selectedTrip?.duration || 'Journey'
      ).toUpperCase();
    }
    if (bookingSummaryDateEl) {
      bookingSummaryDateEl.textContent =
        (hasSelectedDayPayment && plannedDateText) ||
        getTripDateLabel(selectedTrip || {}, { paidAt: new Date().toISOString() });
    }
    if (bookingSummaryTravelersEl) {
      bookingSummaryTravelersEl.textContent = '2 Travelers';
    }

    // Fallback for old cached HTML without IDs.
    const bookingAside = document.querySelector('aside.lg\\:col-span-5');
    if (bookingAside) {
      const badgeFallback = bookingAside.querySelector('.absolute .bg-primary-container');
      if (badgeFallback && !bookingSummaryBadgeEl) {
        badgeFallback.textContent = String(
          hasSelectedDayPayment ? `Day ${Number(candidateDayPayment?.day || 1)} Plan` : selectedTrip?.duration || 'Journey'
        ).toUpperCase();
      }
      const dateRow = Array.from(bookingAside.querySelectorAll('.flex.items-center.gap-1')).find((el) =>
        /calendar_month/i.test(String(el.textContent || ''))
      );
      if (dateRow && !bookingSummaryDateEl) {
        const icon = dateRow.querySelector('.material-symbols-outlined');
        const txt =
          (hasSelectedDayPayment && plannedDateText) ||
          getTripDateLabel(selectedTrip || {}, { paidAt: new Date().toISOString() });
        dateRow.innerHTML = '';
        if (icon) dateRow.appendChild(icon);
        dateRow.append(` ${txt}`);
      }
      const travelersRow = Array.from(bookingAside.querySelectorAll('.flex.items-center.gap-1')).find((el) =>
        /group/i.test(String(el.textContent || ''))
      );
      if (travelersRow && !bookingSummaryTravelersEl) {
        const icon = travelersRow.querySelector('.material-symbols-outlined');
        travelersRow.innerHTML = '';
        if (icon) travelersRow.appendChild(icon);
        travelersRow.append(' 2 Travelers');
      }
    }

    const updateBookingSummary = ({ title, lineLabel, total, note }) => {
      const aside = document.querySelector('aside.lg\\:col-span-5');
      const detailsBox = aside?.querySelector('.p-8.space-y-6');
      const packageTitle = detailsBox?.querySelector('h3.font-h3');
      const breakdown = detailsBox?.querySelector('.border-t.border-outline-variant\\/30.pt-6.space-y-3');
      const totalWrapper = detailsBox?.querySelector('.border-t-2.border-primary-container.pt-6');
      const totalPriceEl = totalWrapper?.querySelector('span.font-h2.text-h2.text-on-surface');
      const totalLabel = totalWrapper?.querySelector('span.font-label-caps');
      const noteEl = totalWrapper?.querySelector('span.text-secondary');
      const actionBtn = totalWrapper?.querySelector('button');

      if (packageTitle) packageTitle.textContent = title;
      if (breakdown) {
        breakdown.innerHTML = `
          <div class="flex justify-between items-center text-on-surface-variant">
            <span>${escapeHtml(lineLabel)}</span>
            <span>${formatMoney(total)}</span>
          </div>
        `;
      }
      if (totalPriceEl) totalPriceEl.textContent = formatMoney(total);
      if (totalLabel) totalLabel.textContent = 'TOTAL PRICE';
      if (noteEl) noteEl.textContent = note;
      if (actionBtn) {
        actionBtn.innerHTML = `CONFIRM AND PAY <span class="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>`;
      }
    };

    if (hasSelectedDayPayment) {
      const dayLabel = Number(candidateDayPayment?.day || 1);
      if (bookingSummaryLineLabelEl)
        bookingSummaryLineLabelEl.textContent =
          plannedLocationSummary || `Selected Day ${dayLabel} Items`;
      updateBookingSummary({
        title: summaryTitleSource || `Day ${dayLabel} - Custom Itinerary`,
        lineLabel: plannedLocationSummary || `Selected Day ${dayLabel} Items`,
        total: selectedDayTotal,
        note: `Day ${dayLabel} payment`,
      });
    } else if (selectedTrip && typeof selectedTrip === 'object' && Number.isFinite(Number(selectedTrip.price))) {
      if (bookingSummaryLineLabelEl) bookingSummaryLineLabelEl.textContent = String(selectedTrip.location || 'Trip booking');
      updateBookingSummary({
        title: selectedTrip.title || 'Selected Trip',
        lineLabel: selectedTrip.location || 'Trip booking',
        total: Number(selectedTrip.price),
        note: 'Trip payment',
      });
    }

    const paymentSelector = setupBookingPaymentSelector();
    const form = confirmBtn.closest('form') || document.querySelector('form');
    const travelerSection = Array.from(document.querySelectorAll('section')).find((section) =>
      normalizeText(section.querySelector('h2')?.textContent || '').includes('traveler information')
    );
    const travelerInputs = travelerSection ? Array.from(travelerSection.querySelectorAll('input')) : [];
    const fullNameInput = travelerInputs[0] || null;
    const emailInput = travelerInputs[1] || null;
    const phoneInput = travelerInputs[2] || null;
    const nationalityInput = travelerInputs[3] || null;
    const draftKey = userScopedKey('kemet-traveler-default', getSessionUser()?.userId || 'guest');
    const travelerDraft = getState(draftKey, {});
    const sessionUser = getSessionUser() || {};

    if (fullNameInput && !fullNameInput.value) {
      fullNameInput.value = travelerDraft.fullName || sessionUser.name || '';
    }
    if (emailInput && !emailInput.value) {
      emailInput.value = travelerDraft.email || sessionUser.email || '';
    }
    if (phoneInput && !phoneInput.value) {
      phoneInput.value = travelerDraft.phone || sessionUser.phone || '';
    }
    if (nationalityInput && !nationalityInput.value) {
      nationalityInput.value = travelerDraft.nationality || '';
    }

    const submitBooking = async (e) => {
      e.preventDefault();
      const user = getSessionUser();
      const trip = getState(SELECTED_TRIP_KEY, null);
      const selectedPaymentMethod = paymentSelector.getSelectedMethod();
      const travelerDetails = {
        fullName: String(fullNameInput?.value || '').trim(),
        email: String(emailInput?.value || '').trim(),
        phone: String(phoneInput?.value || '').trim(),
        nationality: String(nationalityInput?.value || '').trim(),
      };

      if (!travelerDetails.fullName || !travelerDetails.email || !travelerDetails.phone) {
        showToast('Please fill full name, email and phone.');
        return;
      }

      const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(travelerDetails.email);
      if (!emailLooksValid) {
        showToast('Please enter a valid email address.');
        return;
      }
      if (selectedPaymentMethod === 'card') {
        const cardValidation = paymentSelector.validateCardFields();
        if (!cardValidation.ok) {
          showError(cardValidation.message);
          return;
        }
      }

      if (!user?.userId) {
        showToast('Please login first.');
        return navigate(routes.login);
      }

      setState(draftKey, travelerDetails);
      let effectiveTrip = trip;
      if (!effectiveTrip?._id && hasSelectedDayPayment) {
        const paidTrips = getState(PAYMENT_TRIP_NAMES_KEY, []);
        const preferredName = Array.isArray(paidTrips) && paidTrips.length ? String(paidTrips[0]) : '';
        try {
          const allTrips = await api('/api/trips');
          const list = Array.isArray(allTrips) ? allTrips : [];
          if (preferredName) {
            effectiveTrip = list.find((t) => normalizeText(t?.title) === normalizeText(preferredName)) || null;
          }
          if (!effectiveTrip && list.length) effectiveTrip = list[0];
          if (effectiveTrip) setState(SELECTED_TRIP_KEY, effectiveTrip);
        } catch {
          effectiveTrip = trip;
        }
      }

      if (!effectiveTrip?._id) {
        if (hasSelectedDayPayment) {
          const paidTrips = getState(PAYMENT_TRIP_NAMES_KEY, []);
          if (Array.isArray(paidTrips) && paidTrips.length) {
            paidTrips.forEach((tripName) => setTripMeta(tripName, { status: 'Paid' }));
          }
          const paymentPayload = {
            bookingId: `KT-${Date.now()}`,
            title: summaryTitleSource || `Day ${Number(candidateDayPayment?.day || 1)} - Custom Itinerary`,
            totalPaid: bookingTotal,
            travelersText: '2 Adults',
            travelerDetails,
            paymentMethod: selectedPaymentMethod,
            paidAt: new Date().toISOString(),
            tripId: effectiveTrip?._id || selectedTrip?._id || '',
            tripLocation: plannedLocationSummary || String((effectiveTrip || selectedTrip || {}).location || ''),
            tripDuration: String(
              hasSelectedDayPayment
                ? `Day ${Number(candidateDayPayment?.day || 1)} Plan`
                : (effectiveTrip || selectedTrip || {}).duration || ''
            ),
            tripDateText:
              (hasSelectedDayPayment && plannedDateText) ||
              getTripDateLabel(effectiveTrip || selectedTrip || {}, { paidAt: new Date().toISOString() }),
            image: summaryImageSource || getTripDisplayImage(effectiveTrip || selectedTrip || {}),
          };
          setState(LAST_PAYMENT_KEY, paymentPayload);
          setState(userScopedKey(LAST_PAYMENT_KEY, user.userId), paymentPayload);
          localStorage.removeItem('kemet-selected-day-payment');
          localStorage.removeItem(BOOKING_MODE_KEY);
          localStorage.removeItem(PAYMENT_TRIP_NAMES_KEY);
          showSuccess('Payment saved locally. Add a catalog trip to get loyalty points.');
          return navigate(routes.success);
        }
        showToast('No selected trip found.');
        return navigate(routes.trips);
      }

      confirmBtn.disabled = true;
      try {
        const result = await api('/api/bookings', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.userId,
            tripId: effectiveTrip._id,
            travelerDetails,
            totalPrice: bookingTotal,
            paymentMethod: selectedPaymentMethod,
          }),
        });
        const paymentPayload = {
          bookingId: result?.bookingId
            ? `KT-${String(result.bookingId).slice(-8).toUpperCase()}`
            : result?.booking?._id
            ? `KT-${String(result.booking._id).slice(-8).toUpperCase()}`
            : `KT-${Date.now()}`,
          title: hasSelectedDayPayment ? summaryTitleSource || effectiveTrip?.title || 'Selected Trip' : effectiveTrip?.title || 'Selected Trip',
          totalPaid: bookingTotal,
          travelersText: '2 Adults',
          travelerDetails,
          paymentMethod: selectedPaymentMethod,
          paidAt: new Date().toISOString(),
          tripId: effectiveTrip?._id || '',
          tripLocation: hasSelectedDayPayment ? plannedLocationSummary || String(effectiveTrip?.location || '') : String(effectiveTrip?.location || ''),
          tripDuration: hasSelectedDayPayment
            ? `Day ${Number(candidateDayPayment?.day || 1)} Plan`
            : String(effectiveTrip?.duration || ''),
          tripDateText:
            (hasSelectedDayPayment && plannedDateText) ||
            getTripDateLabel(effectiveTrip || {}, { paidAt: new Date().toISOString() }),
          image: summaryImageSource || getTripDisplayImage(effectiveTrip || selectedTrip || {}),
        };
        setState(LAST_PAYMENT_KEY, paymentPayload);
        setState(userScopedKey(LAST_PAYMENT_KEY, user.userId), paymentPayload);
        const paidTrips = getState(PAYMENT_TRIP_NAMES_KEY, []);
        if (Array.isArray(paidTrips) && paidTrips.length) {
          paidTrips.forEach((tripName) => {
            setTripMeta(tripName, { status: 'Paid' });
          });
        }
        const currentUser = getSessionUser() || {};
        const earnedPoints = Number(result?.loyaltyEarned || 0);
        if (earnedPoints > 0) {
          setState(SESSION_KEY, {
            ...currentUser,
            loyaltyPoints: Number(currentUser.loyaltyPoints || 0) + earnedPoints,
            phone: travelerDetails.phone || currentUser.phone || '',
          });
        }
        showSuccess('Booking successful.');
        localStorage.removeItem(BOOKING_MODE_KEY);
        localStorage.removeItem(PAYMENT_TRIP_NAMES_KEY);
        navigate(routes.success);
      } catch (err) {
        showError(err.message);
      } finally {
        confirmBtn.disabled = false;
      }
    };

    confirmBtn.addEventListener('click', submitBooking);
    form?.addEventListener('submit', submitBooking);

    findButtonByText('book now')?.addEventListener('click', submitBooking);
  }

  function setupBookingPaymentSelector() {
    const cardLabel = Array.from(document.querySelectorAll('span')).find((el) =>
      normalizeText(el.textContent).includes('credit / debit card')
    );
    const paypalLabel = Array.from(document.querySelectorAll('span')).find((el) =>
      normalizeText(el.textContent).includes('paypal or bank transfer')
    );

    const cardOption = cardLabel?.closest('div.cursor-pointer');
    const paypalOption = paypalLabel?.closest('div.cursor-pointer');
    const cardNumberInput = document.querySelector('input[placeholder="0000 0000 0000 0000"]');
    const expiryInput = document.querySelector('input[placeholder="MM / YY"]');
    const cvvInput = document.querySelector('input[placeholder="***"]');
    const cardInputsGrid = cardNumberInput?.closest('div.grid');

    let selected = 'card';

    const applyState = () => {
      if (cardOption) {
        cardOption.classList.remove('border-outline-variant');
        cardOption.classList.add('border-primary-container', 'bg-surface-container-low');
      }

      if (paypalOption) {
        paypalOption.classList.remove('border-primary-container', 'bg-surface-container-low');
        paypalOption.classList.add('border-outline-variant');
      }

      const cardCircle = cardOption?.querySelector('div.w-5.h-5');
      const paypalCircle = paypalOption?.querySelector('div.w-5.h-5');

      if (selected === 'card') {
        cardCircle?.classList.remove('border-2', 'border-outline-variant');
        cardCircle?.classList.add('border-4', 'border-primary', 'bg-white');

        paypalCircle?.classList.remove('border-4', 'border-primary');
        paypalCircle?.classList.add('border-2', 'border-outline-variant', 'bg-white');

        cardInputsGrid?.classList.remove('hidden');
      } else {
        cardCircle?.classList.remove('border-4', 'border-primary');
        cardCircle?.classList.add('border-2', 'border-outline-variant', 'bg-white');

        paypalCircle?.classList.remove('border-2', 'border-outline-variant');
        paypalCircle?.classList.add('border-4', 'border-primary', 'bg-white');

        cardInputsGrid?.classList.add('hidden');
      }
    };

    applyState();

    cardOption?.addEventListener('click', (e) => {
      e.preventDefault();
      selected = 'card';
      applyState();
    });

    paypalOption?.addEventListener('click', (e) => {
      e.preventDefault();
      selected = 'paypal';
      applyState();
    });

    return {
      getSelectedMethod: () => selected,
      validateCardFields: () => {
        if (selected !== 'card') return { ok: true };
        const cardNumber = String(cardNumberInput?.value || '').replace(/\s+/g, '');
        const expiry = String(expiryInput?.value || '').trim();
        const cvv = String(cvvInput?.value || '').trim();

        if (cardNumber.length < 12 || !/^\d+$/.test(cardNumber)) {
          return { ok: false, message: 'Please enter a valid card number.' };
        }
        if (!/^\d{2}\s*\/\s*\d{2}$/.test(expiry)) {
          return { ok: false, message: 'Please enter expiry date as MM/YY.' };
        }
        if (!/^\d{3,4}$/.test(cvv)) {
          return { ok: false, message: 'Please enter a valid CVV.' };
        }
        return { ok: true };
      },
    };
  }

  async function wireDashboardPage() {
    const user = getSessionUser();
    if (!user?.userId) return navigate(routes.login);

    // ✅ اعرض الاسم فوراً من الـ session بدون ما تستنى الـ API
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = `Welcome back, ${user.name || 'Traveler'}!`;

    // ✅ اعرض الـ points المحفوظة فوراً لو موجودة
    if (user.loyaltyPoints) {
      updateDashboardStats([]);
    }

    // ✅ اعرض الصفحة فوراً بدون انتظار الـ API
    wireDashboardControls();
    renderSavedDestinationsSection();
    document.dispatchEvent(new CustomEvent('dashboardReady'));

    if (window.location.hash === '#saved' || window.location.hash === '#saved-destinations') {
      setTimeout(() => {
        scrollToSavedDestinations();
      }, 0);
    }

    const upcomingSection = Array.from(document.querySelectorAll('section')).find((section) =>
      normalizeText(section.querySelector('h2')?.textContent || '').includes('upcoming trips')
    );
    const upcomingContainer = upcomingSection?.querySelector('div.bg-surface-container-lowest');

    try {
      // Run user + bookings calls in parallel instead of sequentially
      const [userResult, bookingsResult] = await Promise.allSettled([
        api(`/api/users/${encodeURIComponent(user.userId)}`),
        api(`/api/bookings/${user.userId}`),
      ]);

      if (userResult.status === 'fulfilled' && userResult.value) {
        const freshUser = userResult.value;
        const merged = {
          ...user,
          name: freshUser?.name || user.name,
          email: freshUser?.email || user.email,
          phone: freshUser?.phone || user.phone || '',
          loyaltyPoints: Number(freshUser?.loyaltyPoints || 0),
        };
        setState(SESSION_KEY, merged);
        const h1 = document.querySelector('h1');
        if (h1) h1.textContent = `Welcome back, ${merged.name || 'Traveler'}!`;
      }

      const bookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : null;

      if (upcomingContainer) {
        if (!Array.isArray(bookings) || !bookings.length) {
          upcomingContainer.innerHTML = `
            <div class="p-8 text-center text-stone-500">
              <p>You have not booked any trips yet.</p>
              <button id="dash-browse-trips" class="mt-4 bg-[#775a19] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest">Browse Trips</button>
            </div>
          `;
          document.getElementById('dash-browse-trips')?.addEventListener('click', () => navigate(routes.trips));
        } else {
          upcomingContainer.className = 'grid grid-cols-2 lg:grid-cols-4 gap-4 p-4';
          upcomingContainer.innerHTML = bookings
            .map((booking) => {
              const trip = booking.trip || {};
              return `
                <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 flex flex-col gap-2 shadow-sm">
                  <h3 class="font-semibold text-on-surface text-sm leading-snug">${trip.title || 'Booked Trip'}</h3>
                  <p class="text-on-surface-variant text-xs">${trip.location || 'Egypt'}${trip.duration ? ` • ${trip.duration}` : ''}</p>
                  <p class="text-on-surface-variant/70 text-xs">Booked on ${new Date(booking.bookingDate).toLocaleDateString()}</p>
                  <div class="mt-auto pt-2 flex items-center justify-between gap-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700">${
                      String(booking.status || '').toLowerCase() === 'pending' ? 'Confirmed' : booking.status || 'Confirmed'
                    }</span>
                    <span class="font-semibold text-primary text-sm">${
                      Number.isFinite(Number(booking.totalPrice))
                        ? formatMoney(Number(booking.totalPrice))
                        : typeof trip.price === 'number'
                        ? formatMoney(Number(trip.price))
                        : ''
                    }</span>
                  </div>
                  <button data-id="${trip._id || ''}" class="dash-add-plan text-xs underline text-primary text-left">Add to My Trip</button>
                </div>
              `;
            })
            .join('');

          upcomingContainer.querySelectorAll('.dash-add-plan').forEach((btn) => {
            btn.addEventListener('click', () => {
              const trip = bookings.find((b) => String(b.trip?._id) === String(btn.dataset.id))?.trip;
              if (!trip) return;
              const added = addTripToPlan(trip);
              showToast(added ? 'Trip added to My Trip.' : 'Trip already in My Trip.');
            });
          });
        }
      }

      updateDashboardStats(bookings || []);
      renderDashboardInsights(bookings || []);
      renderBookingAuditWidget(user.userId); // runs in background, doesn't block page
    } catch (err) {
      if (upcomingContainer) {
        upcomingContainer.innerHTML = '<div class="p-8 text-center text-red-600">Failed to load bookings.</div>';
      }
    }
  }

  function renderDashboardInsights(bookings) {
    const host = document.querySelector('main .max-w-7xl') || document.querySelector('main');
    if (!host) return;
    let box = document.getElementById('dashboard-insights-box');
    if (!box) {
      box = document.createElement('section');
      box.id = 'dashboard-insights-box';
      box.className = 'mt-6 grid grid-cols-1 md:grid-cols-3 gap-4';
      host.appendChild(box);
    }

    const safe = Array.isArray(bookings) ? bookings : [];
    const totalSpent = safe.reduce((s, b) => s + Number(b?.totalPrice || 0), 0);
    const avgSpend = safe.length ? totalSpent / safe.length : 0;
    const cityMap = new Map();
    safe.forEach((b) => {
      const loc = String(b?.trip?.location || '').trim();
      if (!loc) return;
      cityMap.set(loc, (cityMap.get(loc) || 0) + 1);
    });
    const topCity = Array.from(cityMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const readyForPerk = Number(getSessionUser()?.loyaltyPoints || 0) >= 2500;

    box.innerHTML = `
      <article class="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
        <p class="text-xs text-outline uppercase tracking-wider">Top Destination</p>
        <p class="mt-2 text-lg font-bold text-on-surface">${escapeHtml(topCity)}</p>
      </article>
      <article class="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
        <p class="text-xs text-outline uppercase tracking-wider">Avg Spend / Booking</p>
        <p class="mt-2 text-lg font-bold text-on-surface">${formatMoney(avgSpend)}</p>
      </article>
      <article class="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
        <p class="text-xs text-outline uppercase tracking-wider">Perk Eligibility</p>
        <p class="mt-2 text-lg font-bold ${readyForPerk ? 'text-green-700' : 'text-primary'}">${
          readyForPerk ? 'Eligible' : 'In Progress'
        }</p>
      </article>
    `;
  }

  async function renderBookingAuditWidget(userId) {
    if (!userId) return;
    const host = document.querySelector('main .max-w-7xl') || document.querySelector('main');
    if (!host) return;
    let panel = document.getElementById('dashboard-booking-audit');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'dashboard-booking-audit';
      panel.className = 'mt-6 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest';
      host.appendChild(panel);
    }
    panel.innerHTML = '<p class="text-sm text-outline">Loading payment audit...</p>';
    try {
      const data = await api(`/api/bookings/${encodeURIComponent(userId)}/audit`);
      const list = Array.isArray(data?.audit) ? data.audit : [];
      panel.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold">Payment Audit Log</h3>
          <span class="text-xs text-outline">${list.length} records</span>
        </div>
        ${
          list.length
            ? `<div class="overflow-x-auto"><table class="w-full text-sm">
                <thead><tr class="text-left text-outline border-b border-outline-variant/30">
                  <th class="py-2 pr-3">Trip</th><th class="py-2 pr-3">Amount</th><th class="py-2 pr-3">Status</th><th class="py-2 pr-3">Date</th>
                </tr></thead>
                <tbody>
                  ${list
                    .slice(0, 8)
                    .map(
                      (row) => `<tr class="border-b border-outline-variant/20">
                        <td class="py-2 pr-3">${escapeHtml(row.tripTitle || 'Trip')}</td>
                        <td class="py-2 pr-3">${formatMoney(Number(row.totalPrice || 0))}</td>
                        <td class="py-2 pr-3"><span class="px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700">${escapeHtml(
                          row.status || 'Confirmed'
                        )}</span></td>
                        <td class="py-2 pr-3">${row.bookedAt ? new Date(row.bookedAt).toLocaleDateString() : '-'}</td>
                      </tr>`
                    )
                    .join('')}
                </tbody>
              </table></div>`
            : '<p class="text-sm text-outline">No payments yet.</p>'
        }
      `;
    } catch (err) {
      panel.innerHTML = `<p class="text-sm text-red-600">${escapeHtml(err?.message || 'Could not load audit log.')}</p>`;
    }
  }

  function updateDashboardStats(bookings) {
    const stats = document.querySelectorAll('section.grid p.text-4xl');
    if (stats.length < 3) return;
    const totalTrips = Array.isArray(bookings) ? bookings.length : 0;
    const destinations = new Set((bookings || []).map((b) => b.trip?.location).filter(Boolean)).size;
    stats[0].textContent = String(totalTrips);
    stats[1].textContent = String(destinations);

    const user = getSessionUser();
    const points = Number(user?.loyaltyPoints || 0);
    stats[2].textContent = points >= 1000 ? `${(points / 1000).toFixed(1)}k` : String(points);

    const loyaltyHint = Array.from(document.querySelectorAll('p')).find((p) =>
      normalizeText(p.textContent || '').includes('points away from your next free nile cruise')
    );
    if (loyaltyHint) {
      const target = 2500;
      const remaining = Math.max(0, target - points);
      loyaltyHint.textContent = `You're ${remaining.toLocaleString()} points away from your next free Nile cruise.`;
    }
  }

  function wireDashboardControls() {
    findButtonByText('plan new trip')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.trips);
    });

    findButtonByText('view itinerary')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.myTrip);
    });

    findButtonByText('manage booking')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Booking management will be expanded soon.');
    });

    findButtonByText('explore perks')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.trips);
    });

    findLinkByText('view all trips')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.trips);
    });

    findLinkByText('explore more')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.explore);
    });

    const asideLinks = Array.from(document.querySelectorAll('aside a'));
    const myTripsAside = asideLinks.find((a) => normalizeText(a.textContent).includes('my trips'));
    const paymentAside = asideLinks.find((a) => normalizeText(a.textContent).includes('payment methods'));
    const profileAside = asideLinks.find((a) => normalizeText(a.textContent).includes('profile settings'));
    const supportAside = asideLinks.find((a) => normalizeText(a.textContent).includes('support'));

    myTripsAside?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.myTrip);
    });
    if (paymentAside) {
      const wrapper = paymentAside.closest('li,div') || paymentAside;
      wrapper.remove();
    }
    profileAside?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.profileSettings);
    });
    supportAside?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.support);
    });
  }

  function wireSupportPage() {
    findButtonByText('send request')?.addEventListener('click', (e) => {
      e.preventDefault();
      showSuccess('Support request sent successfully. We will contact you shortly.');
    });
    findLinkByText('back to dashboard')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.dashboard);
    });
  }

  async function wireProfileSettingsPage() {
    const user = getSessionUser();
    if (!user?.userId) {
      navigate(routes.login);
      return;
    }

    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');
    const pointsEl = document.getElementById('profile-loyalty-points');
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    try {
      const freshUser = await api(`/api/users/${encodeURIComponent(user.userId)}`);
      const merged = {
        ...user,
        name: freshUser?.name || user.name,
        email: freshUser?.email || user.email,
        phone: freshUser?.phone || user.phone || '',
        loyaltyPoints: Number(freshUser?.loyaltyPoints || 0),
      };
      setState(SESSION_KEY, merged);
      if (nameInput) nameInput.value = merged.name || '';
      if (emailInput) emailInput.value = merged.email || '';
      if (phoneInput) phoneInput.value = merged.phone || '';
      if (pointsEl) pointsEl.textContent = String(merged.loyaltyPoints || 0);
    } catch (err) {
      showError(err?.message || 'Failed to load profile.');
    }

    profileForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: String(nameInput?.value || '').trim(),
        email: String(emailInput?.value || '').trim(),
        phone: String(phoneInput?.value || '').trim(),
      };
      if (!payload.name || !payload.email || !payload.phone) {
        showError('Name, email and phone are required.');
        return;
      }
      try {
        const data = await api(`/api/users/${encodeURIComponent(user.userId)}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        const current = getSessionUser() || {};
        setState(SESSION_KEY, { ...current, ...data.user });
          showSuccess('Profile updated successfully.');
      } catch (err) {
        showError(err?.message || 'Could not update profile.');
      }
    });

    passwordForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = String(currentPasswordInput?.value || '');
      const newPassword = String(newPasswordInput?.value || '');
      const confirmPassword = String(confirmPasswordInput?.value || '');
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Fill all password fields.');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('New password and confirm password do not match.');
        return;
      }
      try {
        await api(`/api/users/${encodeURIComponent(user.userId)}/password`, {
          method: 'PATCH',
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
          showSuccess('Password changed successfully.');
      } catch (err) {
        showError(err?.message || 'Could not change password.');
      }
    });
  }

  function wireMyTripPage() {
    const col = document.querySelector('.lg\\:col-span-7');
    if (!col) return;

    const old = document.getElementById('plan-dynamic');
    if (old) old.remove();

    const activeTripName = getActiveTripName();
    if (activeTripName) setState(TRIP_PLAN_SELECTED_KEY, activeTripName);

    const tripHeader = document.createElement('section');
    tripHeader.className = 'mb-6 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest';
    tripHeader.innerHTML = `
      <div class="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
        <div class="flex-1">
          <label class="text-sm text-outline block mb-2">Trip Name</label>
          <select id="my-trip-name-select" class="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"></select>
        </div>
        <div>
          <label class="text-sm text-outline block mb-2">Trip Date</label>
          <input id="my-trip-date-input" type="date" class="px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"/>
        </div>
        <div class="flex gap-2">
          <button id="my-trip-create-btn" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">Create Trip</button>
          <button id="my-trip-soft-reset-btn" class="px-4 py-2 border border-outline text-on-surface rounded-lg text-sm font-bold">Soft Reset</button>
          <button id="my-trip-reset-btn" class="px-4 py-2 border border-outline text-on-surface rounded-lg text-sm font-bold">Reset My Trips</button>
        </div>
      </div>
    `;
    col.prepend(tripHeader);
    const tripCardsHost = document.createElement('section');
    tripCardsHost.id = 'my-trip-cards-host';
    tripCardsHost.className = 'space-y-4';
    col.insertBefore(tripCardsHost, tripHeader.nextSibling);

    const removeLegacyItineraryUI = () => {
      Array.from(col.querySelectorAll('h1,h2,h3,div,section,article')).forEach((el) => {
        const text = normalizeText(el.textContent || '');
        if (text === 'itinerary' || text.includes('itinerary add activity')) {
          const block = el.closest('section,div,article') || el.parentElement;
          block?.remove();
        }
      });
      const itineraryHeaderRow = Array.from(col.querySelectorAll('div')).find((el) => {
        const text = normalizeText(el.textContent || '');
        return text.includes('itinerary') && text.includes('add activity');
      });
      itineraryHeaderRow?.remove();
      Array.from(col.querySelectorAll('div,section,article')).forEach((el) => {
        const text = normalizeText(el.textContent || '');
        if (
          text.includes('plan your day') ||
          text.includes('day planner draft') ||
          /day\s+\d+/.test(text) ||
          text.includes('custom day plan')
        ) {
          el.remove();
        }
      });
    };
    removeLegacyItineraryUI();

    const getReadyTripsTotal = () => {
      const names = getTripNames();
      const plan = getPlanTrips();
      return names.reduce((sum, name) => {
        const meta = getTripMeta(name);
        if (meta.status !== 'Ready for Payment') return sum;
        const tripTotal = plan
          .filter((item) => normalizeText(item.tripName) === normalizeText(name))
          .reduce((s, item) => s + Number(item.price || 0), 0);
        return sum + tripTotal;
      }, 0);
    };

    findButtonByText('proceed to booking')?.addEventListener('click', (e) => {
      e.preventDefault();
      const readyTripNames = getTripNames().filter((name) => getTripMeta(name).status === 'Ready for Payment');
      const total = getReadyTripsTotal();
      if (!total) {
        showToast('Confirm at least one trip first.');
        return;
      }
      setState(PAYMENT_TRIP_NAMES_KEY, readyTripNames);
      setState('kemet-selected-day-payment', { day: 1, total });
      setState(BOOKING_MODE_KEY, 'day');
      navigate(routes.booking);
    });

    findButtonByText('book all')?.addEventListener('click', (e) => {
      e.preventDefault();
      const total = getPlanTripsForActiveTrip().reduce((sum, item) => sum + Number(item.price || 0), 0);
      setState('kemet-selected-day-payment', { day: 1, total });
      setState(BOOKING_MODE_KEY, 'day');
      navigate(routes.booking);
    });

    findButtonByText('save trip')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Trip plan saved locally.');
    });

    (findLinkByText('view all options') || findLinkByText('view all cairo options'))?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.hotels);
    });

    findButtonByText('add activity')?.addEventListener('click', (e) => {
      e.preventDefault();
      const activeName = getActiveTripName();
      if (activeName && getTripMeta(activeName).status === 'Paid') {
        showError('This trip is already paid. You cannot add more activities.');
        return;
      }
      navigate(routes.explore);
    });

    const rightCol = document.querySelector('.lg\\:col-span-5');
    if (!rightCol) return;

    const DAY_DRAFT_KEY = 'kemet-day-draft';
    const tripDurationText = Array.from(document.querySelectorAll('span'))
      .map((el) => el.textContent || '')
      .find((text) => /days?/i.test(text));
    const tripDurationMatch = String(tripDurationText || '').match(/(\d+)\s*days?/i);
    const maxTripDays = Number(tripDurationMatch?.[1] || 10);
    const summaryCard = rightCol.querySelector('.bg-on-surface.text-surface');
    summaryCard?.remove();
    const dayPlaceholder = Array.from(col.querySelectorAll('div')).find((el) => {
      const text = normalizeText(el.textContent);
      return text.includes('plan day 3') || text.includes('plan your day');
    });
    const tripNameSelect = document.getElementById('my-trip-name-select');
    const createTripBtn = document.getElementById('my-trip-create-btn');
    const softResetTripsBtn = document.getElementById('my-trip-soft-reset-btn');
    const resetTripsBtn = document.getElementById('my-trip-reset-btn');
    const tripDateInput = document.getElementById('my-trip-date-input');

    const removeLegacyPlannedTripsPanel = () => {
      const legacy = Array.from(col.querySelectorAll('section,div')).find((el) =>
        normalizeText(el.textContent || '').includes('planned trips')
      );
      legacy?.remove();
    };
    removeLegacyPlannedTripsPanel();

    const parsePrice = (text) => {
      const matched = String(text || '')
        .replace(/,/g, '')
        .match(/\$ ?([0-9]+(?:\.[0-9]+)?)/);
      return matched ? Number(matched[1]) : 0;
    };

    const getDraftItems = () => {
      const list = getState(DAY_DRAFT_KEY, []);
      return Array.isArray(list) ? list : [];
    };

    const setDraftItems = (items) => {
      setState(DAY_DRAFT_KEY, Array.isArray(items) ? items : []);
    };

    const toDraftItemFromPlan = (item) => {
      const title = item?.title || 'Planned Item';
      return {
        id: `plan-${item?._id || slugify(title)}`,
        title,
        subtitle: `${item?.location || 'Egypt'}${item?.duration ? ` • ${item.duration}` : ''}`,
        price: Number(item?.price || 0),
        type: item?.source || 'trip',
      };
    };

    const getDayCards = () =>
      Array.from(col.querySelectorAll('div.bg-surface-container-lowest')).filter((card) =>
        /day\s+\d+/i.test(card.querySelector('div.absolute.-left-3')?.textContent || '')
      );

    const removeAllDayCards = () => {
      getDayCards().forEach((card) => card.remove());
    };

    const getDayNumber = (dayCard) => {
      const label = dayCard?.querySelector('div.absolute.-left-3')?.textContent || '';
      const m = label.match(/(\d+)/);
      return m ? Number(m[1]) : null;
    };

    const getDayTotal = (dayCard) => {
      if (!dayCard) return 0;
      return Array.from(dayCard.querySelectorAll('*'))
        .filter((el) => el.children.length === 0)
        .map((el) => parsePrice(el.textContent))
        .filter((n) => n > 0)
        .reduce((sum, n) => sum + n, 0);
    };

    const ensureDayTotalBox = () => {
      if (!summaryCard) return null;
      let box = summaryCard.querySelector('#selected-day-total-box');
      if (box) return box;
      box = document.createElement('div');
      box.id = 'selected-day-total-box';
      box.className = 'mb-6 p-3 rounded-lg border border-surface/20 bg-surface/5';
      box.innerHTML = `
        <div class="flex justify-between items-center text-sm">
          <span class="text-surface/70">Selected Day Total</span>
          <span id="selected-day-total-value" class="font-bold text-primary-fixed-dim">$0</span>
        </div>
      `;
      const actions = summaryCard.querySelector('.grid.grid-cols-2');
      if (actions) {
        summaryCard.insertBefore(box, actions);
      } else {
        summaryCard.appendChild(box);
      }
      return box;
    };

    const simplifySummaryCard = () => {
      if (!summaryCard) return;
      summaryCard.querySelector('.space-y-4.border-b.border-surface\\/20.pb-6.mb-6')?.remove();
      summaryCard.querySelector('.flex.justify-between.items-center.mb-8')?.remove();
      summaryCard.querySelector('p.text-\\[10px\\].text-center')?.remove();

      const actions = summaryCard.querySelector('.grid.grid-cols-2, .grid.grid-cols-1');
      if (!actions) return;

      actions.className = 'grid grid-cols-1 gap-3';
      const buttons = actions.querySelectorAll('button');
      const primary = buttons[buttons.length - 1] || buttons[0];
      if (!primary) return;

      actions.innerHTML = '';
      primary.id = 'book-selected-day-btn';
      primary.textContent = 'Book Selected Day';
      primary.className = 'py-3 bg-primary text-white rounded font-bold hover:bg-primary/90 active:scale-95 transition-transform';
      actions.appendChild(primary);
    };

    const findDayCardByNumber = (dayNumber) =>
      getDayCards().find((card) => Number(getDayNumber(card)) === Number(dayNumber));

    const updateSummaryForDayNumber = (dayNumber) => {
      const totalValue = document.getElementById('selected-day-total-value');
      if (!totalValue) return;
      const dayCard = findDayCardByNumber(dayNumber);
      const total = dayCard ? getDayTotal(dayCard) : 0;
      totalValue.textContent = `$${total.toLocaleString('en-US')} (Day ${dayNumber || '-'})`;
    };

    const selectDayCard = (dayCard) => {
      getDayCards().forEach((card) => {
        card.classList.remove('ring-2', 'ring-primary/40');
      });
      dayCard?.classList.add('ring-2', 'ring-primary/40');
      if (!dayCard) return;
      const dayNumber = getDayNumber(dayCard) || '-';
      ensureDayTotalBox();
      updateSummaryForDayNumber(dayNumber);
      const daySelect = document.getElementById('day-target-select');
      if (daySelect && dayNumber) daySelect.value = String(dayNumber);
    };

    const bindDayCardControls = (dayCard) => {
      if (!dayCard || dayCard.dataset.dayBound === '1') return;
      dayCard.dataset.dayBound = '1';

      dayCard.addEventListener('click', (e) => {
        const isClose = e.target.closest('span[data-icon="close"]');
        if (isClose) return;
        selectDayCard(dayCard);
      });

      const closeIcon = dayCard.querySelector('span[data-icon="close"]');
      closeIcon?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const removedDay = getDayNumber(dayCard);
        dayCard.remove();
        if (removedDay === 3 && dayPlaceholder) dayPlaceholder.classList.remove('hidden');
        refreshDayTargetOptions();
        const first = getDayCards()[0] || null;
        selectDayCard(first);
      });
    };

    let draftPanel = document.getElementById('day-draft-panel');
    if (!draftPanel) {
      draftPanel = document.createElement('section');
      draftPanel.id = 'day-draft-panel';
      draftPanel.className = 'bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 space-y-4';
      draftPanel.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 class="text-xl font-semibold">Day Planner Draft</h3>
            <p class="text-sm text-outline">Add from the right side, then confirm to place items into your selected day.</p>
          </div>
          <div class="text-sm text-outline">Draft Total: <span id="day-draft-total" class="font-bold text-primary">$0</span></div>
        </div>
        <div class="flex items-center gap-2">
          <label for="day-target-select" class="text-sm text-outline">Target Day</label>
          <select id="day-target-select" class="px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm">
            <option value="1">Day 1</option>
            <option value="2">Day 2</option>
            <option value="3">Day 3</option>
          </select>
        </div>
        <div id="day-draft-items" class="space-y-2"></div>
        <div class="flex flex-wrap gap-2">
          <button id="day-draft-confirm" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">Confirm to Day</button>
          <button id="day-draft-clear" class="px-4 py-2 border border-outline text-on-surface rounded-lg text-sm font-bold">Clear Draft</button>
        </div>
      `;

      const itineraryTitleBlock = Array.from(col.querySelectorAll('div')).find((el) =>
        normalizeText(el.textContent).includes('itinerary')
      );
      if (itineraryTitleBlock?.nextElementSibling) {
        itineraryTitleBlock.parentElement.insertBefore(draftPanel, itineraryTitleBlock.nextElementSibling);
      } else {
        col.prepend(draftPanel);
      }
    }
    // Day draft flow is deprecated in favor of direct add-to-trip by trip/day selection.
    draftPanel?.remove();

    const refreshDayTargetOptions = () => {
      const select = document.getElementById('day-target-select');
      if (!select) return;
      const existingDayNumbers = getDayCards()
        .map((card) => getDayNumber(card))
        .filter((n) => Number.isFinite(n));
      const rangeDays = Array.from({ length: Math.max(maxTripDays, 3) }, (_, idx) => idx + 1);
      const uniqueSorted = Array.from(new Set([...rangeDays, ...existingDayNumbers])).sort((a, b) => a - b);
      const previous = Number(select.value || uniqueSorted[0] || 1);
      select.innerHTML = uniqueSorted.map((n) => `<option value="${n}">Day ${n}</option>`).join('');
      select.value = String(uniqueSorted.includes(previous) ? previous : uniqueSorted[0] || 1);
      updateSummaryForDayNumber(Number(select.value));
    };

    const refreshTripSelector = () => {
      if (!tripNameSelect) return;
      const names = getTripNames();
      const active = getActiveTripName();
      if (!names.length) {
        tripNameSelect.innerHTML = '<option value="">No trips yet</option>';
        tripNameSelect.value = '';
        if (tripDateInput) tripDateInput.value = '';
        return;
      }
      tripNameSelect.innerHTML = names
        .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
        .join('');
      tripNameSelect.value = names.includes(active) ? active : names[0];
      setState(TRIP_PLAN_SELECTED_KEY, tripNameSelect.value);
      if (tripDateInput) tripDateInput.value = getTripDate(tripNameSelect.value);
    };

    const renderDraft = () => {
      const itemsHost = document.getElementById('day-draft-items');
      const totalHost = document.getElementById('day-draft-total');
      if (!itemsHost || !totalHost) return;
      const items = getDraftItems();
      if (!items.length) {
        itemsHost.innerHTML = '<p class="text-sm text-outline">No items selected yet.</p>';
        totalHost.textContent = '$0';
        return;
      }
      itemsHost.innerHTML = items
        .map(
          (item) => `
            <div class="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container">
              <div>
                <p class="font-semibold text-sm">${escapeHtml(item.title || 'Item')}</p>
                <p class="text-xs text-outline">${escapeHtml(item.subtitle || '')}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-primary">$${Number(item.price || 0).toLocaleString('en-US')}</span>
                <button data-remove-draft="${escapeHtml(item.id)}" class="text-xs underline text-secondary">Remove</button>
              </div>
            </div>
          `
        )
        .join('');
      totalHost.textContent = `$${items.reduce((sum, item) => sum + Number(item.price || 0), 0).toLocaleString('en-US')}`;
      itemsHost.querySelectorAll('[data-remove-draft]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-remove-draft');
          setDraftItems(getDraftItems().filter((item) => String(item.id) !== String(id)));
          renderDraft();
          syncSourceButtons();
        });
      });
    };

    const makeDayItemHtml = (item) => `
      <div class="flex items-center gap-4 p-4 bg-surface-container rounded-lg">
        <div class="w-12 h-12 rounded-lg overflow-hidden bg-surface-dim flex items-center justify-center">
          <span class="material-symbols-outlined text-primary" data-icon="auto_awesome">auto_awesome</span>
        </div>
        <div>
          <p class="font-bold">${escapeHtml(item.title || 'New item')}</p>
          <p class="text-sm text-outline">${escapeHtml(item.subtitle || '')}</p>
        </div>
        <span class="ml-auto text-primary font-bold">$${Number(item.price || 0).toLocaleString('en-US')}</span>
      </div>
    `;

    const ensureDayCard = (dayNumber) => {
      const existing = getDayCards().find((card) => getDayNumber(card) === dayNumber);
      if (existing) return existing;
      const card = document.createElement('div');
      card.className = 'bg-surface-container-lowest p-gutter rounded-xl editorial-shadow border-l-4 border-primary relative';
      card.innerHTML = `
        <div class="absolute -left-3 top-6 bg-primary text-white text-xs font-bold px-2 py-1 rounded">DAY ${dayNumber}</div>
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-h3 text-h3 text-on-surface">Custom Day Plan</h3>
            <p class="text-outline">Built from your selected activities</p>
          </div>
          <div class="flex gap-2">
            <span class="material-symbols-outlined text-outline cursor-pointer hover:text-primary" data-icon="drag_indicator">drag_indicator</span>
            <span class="material-symbols-outlined text-outline cursor-pointer hover:text-error" data-icon="close">close</span>
          </div>
        </div>
        <div class="space-y-3" data-day-items></div>
      `;
      if (dayPlaceholder) {
        col.insertBefore(card, dayPlaceholder);
      } else {
        col.appendChild(card);
      }
      bindDayCardControls(card);
      return card;
    };

    const addToDraft = (item) => {
      const current = getDraftItems();
      if (current.some((i) => String(i.id) === String(item.id))) {
        showToast('Item already in draft.');
        return;
      }
      setDraftItems([...current, item]);
      renderDraft();
      syncSourceButtons();
      showToast('Added to draft.');
    };

    const renderActiveTripFromPlan = () => {
      // Legacy itinerary day cards removed; cards view is now the single source of truth.
      removeAllDayCards();
      if (dayPlaceholder) dayPlaceholder.remove();
    };

    const getTripsForCards = () => {
      const names = getTripNames();
      const plan = getPlanTrips();
      return names.map((name) => {
        const items = plan.filter((item) => normalizeText(item.tripName) === normalizeText(name));
        const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
        const breakdown = items.reduce(
          (acc, item) => {
            const source = normalizeText(item.source || '');
            const amount = Number(item.price || 0);
            if (source.includes('hotel') || source.includes('stay')) acc.hotels += amount;
            else if (source.includes('transport')) acc.transport += amount;
            else acc.activities += amount;
            return acc;
          },
          { hotels: 0, activities: 0, transport: 0 }
        );
        const meta = getTripMeta(name);
        const date = getTripDate(name) || meta.date || '';
        const status = meta.status || 'Draft';
        return { name, items, total, date, status, breakdown };
      }).filter((trip) => trip.items.length > 0 || getTripMeta(trip.name).userCreated);
    };

    const renderTripCards = () => {
      const cards = getTripsForCards();
      if (!tripCardsHost) return;
      if (!cards.length) {
        tripCardsHost.innerHTML = `
          <div class="flex flex-col items-center justify-center py-16 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30">
            <span class="material-symbols-outlined text-6xl text-outline mb-4">luggage</span>
            <h3 class="text-lg font-semibold text-on-surface mb-2">No trips yet</h3>
            <p class="text-sm text-on-surface-variant mb-6 max-w-xs">Create a trip first using the "Create Trip" button, then add places and activities to it.</p>
            <button onclick="document.getElementById('my-trip-create-btn')?.click()" class="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold">Create Your First Trip</button>
          </div>
        `;
        return;
      }
      tripCardsHost.innerHTML = cards
        .map((trip) => {
          const isPaid = trip.status === 'Paid';
          const dayLines = trip.items
            .sort((a, b) => Number(a.targetDay || 1) - Number(b.targetDay || 1))
            .map(
              (item) =>
                `<li class="text-sm text-on-surface-variant flex items-center justify-between gap-2">
                  <span class="flex-1">Day ${Number(item.targetDay || 1)} - ${escapeHtml(item.title || 'Activity')}</span>
                  ${
                    isPaid
                      ? ''
                      : `<select data-move-activity="${escapeHtml(item.entryId || item._id)}" class="text-xs border border-outline-variant rounded px-2 py-1 bg-white">
                    ${Array.from({ length: Math.max(maxTripDays, 3) }, (_, i) => i + 1)
                      .map((dayNum) => `<option value="${dayNum}" ${Number(item.targetDay || 1) === dayNum ? 'selected' : ''}>Day ${dayNum}</option>`)
                      .join('')}
                  </select>`
                  }
                  ${isPaid ? '' : `<button data-remove-activity="${escapeHtml(item.entryId || item._id)}" data-trip-name="${escapeHtml(trip.name)}" class="text-xs underline text-red-600">Remove</button>`}
                </li>`
            )
            .join('');
          return `
            <article class="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest" data-trip-card="${escapeHtml(
              trip.name
            )}">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 class="text-lg font-semibold">${escapeHtml(trip.name)}</h3>
                  <p class="text-sm text-outline">${trip.date ? escapeHtml(trip.date) : 'No date selected'}</p>
                  <p class="text-sm mt-1">Status: <span class="font-bold ${
                    trip.status === 'Ready for Payment'
                      ? 'text-[#775A19]'
                      : trip.status === 'Paid'
                      ? 'text-[#775A19]'
                      : 'text-primary'
                  }">${escapeHtml(trip.status)}</span></p>
                </div>
                <div class="flex gap-2">
                  <button data-card-activity="${escapeHtml(trip.name)}" class="px-3 py-2 rounded border border-secondary text-secondary text-sm font-bold ${
                    isPaid ? 'opacity-50 pointer-events-none' : ''
                  }">${isPaid ? 'Locked' : 'Add Activity'}</button>
                  <button data-card-confirm="${escapeHtml(trip.name)}" class="px-3 py-2 rounded bg-primary text-white text-sm font-bold ${
                    trip.status === 'Paid' ? 'opacity-50 pointer-events-none' : ''
                  }">${trip.status === 'Paid' ? 'Confirmed' : 'Confirm'}</button>
                  <button data-card-pay="${escapeHtml(trip.name)}" class="px-3 py-2 rounded bg-[#775A19] text-white text-sm font-bold ${
                    trip.status === 'Ready for Payment' ? '' : 'opacity-50 pointer-events-none'
                  }">${trip.status === 'Paid' ? 'Paid' : 'Pay to Confirm Booking'}</button>
                </div>
              </div>
              <div class="mt-3">
                <ul class="space-y-1">${dayLines || '<li class="text-sm text-outline">No activities yet.</li>'}</ul>
                <div class="mt-3 p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low">
                  <p class="text-xs uppercase tracking-wider text-outline mb-2">Payment Breakdown</p>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <p>Hotels: <span class="font-bold text-primary">${formatMoney(Number(trip.breakdown?.hotels || 0))}</span></p>
                    <p>Activities: <span class="font-bold text-primary">${formatMoney(Number(trip.breakdown?.activities || 0))}</span></p>
                    <p>Transport: <span class="font-bold text-primary">${formatMoney(Number(trip.breakdown?.transport || 0))}</span></p>
                  </div>
                </div>
                <p class="mt-2 text-sm font-bold text-primary">Total: ${formatMoney(trip.total)}</p>
              </div>
            </article>
          `;
        })
        .join('');

      tripCardsHost.querySelectorAll('[data-card-activity]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const name = btn.getAttribute('data-card-activity') || '';
          setState(TRIP_PLAN_SELECTED_KEY, name);
          navigate(routes.explore);
        });
      });

      tripCardsHost.querySelectorAll('[data-card-confirm]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const name = btn.getAttribute('data-card-confirm') || '';
          if ((getTripMeta(name).status || '') === 'Paid') return;
          setTripMeta(name, { status: 'Ready for Payment', date: getTripDate(name) || getTripMeta(name).date || '' });
          renderTripCards();
          showToast('Trip is Ready for Payment.');
        });
      });

      tripCardsHost.querySelectorAll('[data-card-pay]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const name = btn.getAttribute('data-card-pay') || '';
          const trip = getTripsForCards().find((t) => normalizeText(t.name) === normalizeText(name));
          if (!trip) return;
          setState(TRIP_PLAN_SELECTED_KEY, name);
          setState(PAYMENT_TRIP_NAMES_KEY, [name]);
          setState('kemet-selected-day-payment', { day: 1, total: Number(trip.total || 0) });
          setState(BOOKING_MODE_KEY, 'day');
          navigate(routes.booking);
        });
      });

      tripCardsHost.querySelectorAll('[data-remove-activity]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const entryId = btn.getAttribute('data-remove-activity');
          if (!entryId) return;
          removePlanEntry(entryId);
          renderActiveTripFromPlan();
          renderTripCards();
          refreshDayTargetOptions();
          updateSuggestedHotelsForActiveTrip();
          showSuccess('Activity removed.');
        });
      });

      tripCardsHost.querySelectorAll('[data-move-activity]').forEach((select) => {
        select.addEventListener('change', () => {
          const entryId = select.getAttribute('data-move-activity');
          const nextDay = Math.max(1, Number(select.value || 1));
          const plan = getPlanTrips();
          const idx = plan.findIndex((item) => String(item.entryId || item._id) === String(entryId));
          if (idx === -1) return;
          plan[idx] = { ...plan[idx], targetDay: nextDay };
          setState(PLAN_KEY, plan);
          renderTripCards();
          updateSuggestedHotelsForActiveTrip();
          showSuccess(`Activity moved to Day ${nextDay}.`);
        });
      });
    };

    const updateSuggestedHotelsForActiveTrip = async () => {
      const hotelSection = Array.from(rightCol.querySelectorAll('section')).find((sec) =>
        normalizeText(sec.querySelector('h2')?.textContent || '').includes('stay in')
      );
      if (!hotelSection) return;
      const cardHost = hotelSection.querySelector('.bg-surface-container-lowest');
      if (!cardHost) return;

      const activeItems = getPlanTripsForActiveTrip();
      const knownCities = ['cairo', 'giza', 'alexandria', 'luxor', 'aswan', 'sharm', 'hurghada', 'siwa', 'dahab'];
      const cityHints = Array.from(
        new Set(
          activeItems
            .flatMap((item) => {
              const raw = normalizeText(`${item.location || ''} ${item.title || ''} ${item.description || ''}`);
              return knownCities.filter((city) => raw.includes(city));
            })
            .map((city) => city.charAt(0).toUpperCase() + city.slice(1))
        )
      );
      if (!cityHints.length) {
        cardHost.innerHTML = '<p class="text-sm text-outline">No hotel suggestions yet. Add activities first.</p>';
        return;
      }
      const titleEl = hotelSection.querySelector('h2');
      if (titleEl) {
        titleEl.textContent =
          cityHints.length === 1 ? `Stay in ${cityHints[0]}` : `Stay Suggestions (${cityHints.join(', ')})`;
      }

      try {
        const hotels = await api('/api/hotels', { cache: 'no-store' });
        const allHotels = Array.isArray(hotels) ? hotels : [];
        const matched = allHotels.filter((hotel) => {
          const city = getHotelCityName(hotel);
          return cityHints.some((hint) => normalizeText(city).includes(normalizeText(hint)));
        });
        if (!matched.length) {
          cardHost.innerHTML = '<p class="text-sm text-outline">No matching hotels found for selected city.</p>';
          return;
        }

        const scoreHotel = (h) =>
          Number(h.userRating ?? h.rating ?? 0) * 1000 - Number(h.pricePerNight ?? h.price ?? 0);

        let selectedHotels = [];
        if (cityHints.length === 1) {
          // Single city: show all hotels from that city (so if 2 hotels in Luxor, show both).
          selectedHotels = matched
            .sort((a, b) => scoreHotel(b) - scoreHotel(a))
            .slice(0, 6);
        } else {
          // Multi-city: ensure at least one hotel per city.
          const pickedIds = new Set();
          cityHints.forEach((hint) => {
            const candidates = matched
              .filter((h) => normalizeText(getHotelCityName(h)).includes(normalizeText(hint)))
              .sort((a, b) => scoreHotel(b) - scoreHotel(a));
            if (candidates[0] && !pickedIds.has(String(candidates[0]._id))) {
              selectedHotels.push(candidates[0]);
              pickedIds.add(String(candidates[0]._id));
            }
          });
          // Fill extras (if needed) by best score.
          matched
            .sort((a, b) => scoreHotel(b) - scoreHotel(a))
            .forEach((h) => {
              if (selectedHotels.length >= Math.max(cityHints.length, 3)) return;
              const id = String(h._id);
              if (!pickedIds.has(id)) {
                selectedHotels.push(h);
                pickedIds.add(id);
              }
            });
        }

        cardHost.innerHTML = selectedHotels
          .map((top) => {
            const image = resolveImageUrl(Array.isArray(top.images) ? top.images[0] : '');
            return `
              <div class="group overflow-hidden rounded-lg border border-outline-variant/30 p-3 mb-3">
                <div class="relative h-40 rounded-md overflow-hidden">
                  <img alt="${escapeHtml(top.name || top.title || 'Hotel')}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${escapeHtml(image)}"/>
                </div>
                <div class="pt-3">
                  <div class="flex justify-between items-start mb-1 gap-2">
                    <h4 class="font-bold text-base">${escapeHtml(top.name || top.title || 'Hotel')}</h4>
                    <span class="text-primary font-bold whitespace-nowrap">${formatMoney(Number(top.pricePerNight ?? top.price ?? 0))}<span class="text-xs text-outline font-normal">/night</span></span>
                  </div>
                  <p class="text-xs text-outline mb-2">${escapeHtml(getHotelLocationLabel(top))}</p>
                  <p class="text-sm text-outline mb-3 line-clamp-2">${escapeHtml(top.description || '')}</p>
                  <div class="grid grid-cols-2 gap-2">
                    <a href="${routes.hotelDetails}?id=${encodeURIComponent(top._id)}" class="py-2 border border-secondary text-secondary font-bold rounded hover:bg-secondary/5 transition-all uppercase tracking-widest text-[11px] text-center">View Details</a>
                    <button class="py-2 border border-primary text-primary font-bold rounded hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-[11px]" data-add-hotel-suggested="${escapeHtml(top._id)}">Add to Itinerary</button>
                  </div>
                </div>
              </div>
            `;
          })
          .join('');

        cardHost.querySelectorAll('[data-add-hotel-suggested]').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const hid = btn.getAttribute('data-add-hotel-suggested');
            const chosen = selectedHotels.find((h) => String(h._id) === String(hid));
            if (!chosen) return;
            const result = await addTripToPlanWithSelection(toPlanTripFromHotel(chosen), 1);
            if (!result.cancelled) {
              renderActiveTripFromPlan();
              renderTripCards();
              refreshDayTargetOptions();
            }
          });
        });
        applyImageFallbacks(cardHost);
      } catch {
        // keep original static card if hotels fail
      }
    };

    const extractOptionData = (button) => {
      const hotelBlock = button.closest('.pt-4');
      if (hotelBlock && normalizeText(button.textContent).includes('add to itinerary')) {
        const title = hotelBlock.querySelector('h4')?.textContent?.trim() || 'Accommodation';
        const sectionTitle = hotelBlock.closest('section')?.querySelector('h2')?.textContent || 'Cairo';
        const cityName = String(sectionTitle).replace(/stay in/gi, '').trim() || 'Cairo';
        const subtitle = cityName;
        const priceText = hotelBlock.querySelector('span.text-primary.font-bold')?.textContent || '$0';
        return { id: `stay-${slugify(title)}`, title, subtitle, price: parsePrice(priceText), type: 'stay' };
      }

      const transportRow = button.closest('.flex.items-center.gap-4');
      if (transportRow) {
        const title = transportRow.querySelector('p.font-bold')?.textContent?.trim() || 'Transport';
        const subtitle =
          getPlanTripsForActiveTrip()[0]?.location ||
          transportRow.querySelector('p.text-xs')?.textContent?.trim() ||
          'Egypt';
        const priceText = transportRow.querySelector('.text-right p.font-bold')?.textContent || '$0';
        return { id: `transport-${slugify(title)}`, title, subtitle, price: parsePrice(priceText), type: 'transport' };
      }

      return null;
    };

    const sourceButtons = Array.from(rightCol.querySelectorAll('button')).filter((btn) => {
      const txt = normalizeText(btn.textContent);
      return txt.includes('add to itinerary') || txt === 'add' || txt === 'booked';
    });

    const syncSourceButtons = () => {
      const activePlan = getPlanTripsForActiveTrip();
      sourceButtons.forEach((btn) => {
        if (!btn.dataset.defaultLabel) btn.dataset.defaultLabel = btn.textContent.trim();
        const item = extractOptionData(btn);
        if (!item) return;
        const exists = activePlan.some((d) => String(d._id || d.id) === String(item.id));
        btn.textContent = exists ? 'Added' : btn.dataset.defaultLabel;
      });
    };

    sourceButtons.forEach((btn) => {
      if (btn.dataset.wiredTrip === '1') return;
      btn.dataset.wiredTrip = '1';
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const item = extractOptionData(btn);
        if (!item) return;
        const result = await addTripToPlanWithSelection(
          {
            _id: item.id,
            title: item.title,
            location: item.subtitle || 'Egypt',
            duration: item.type === 'transport' ? 'Transport' : 'Stay',
            price: Number(item.price || 0),
            description: item.subtitle || '',
            image: '',
            source: item.type || 'activity',
          },
          1
        );
        if (result.cancelled) return;
        renderActiveTripFromPlan();
        renderTripCards();
        refreshDayTargetOptions();
        selectDayCard(getDayCards()[0] || null);
        updateSuggestedHotelsForActiveTrip();
        syncSourceButtons();
        showToast(
          result.added
            ? `${item.title} added to "${result.selection.tripName}" - Day ${result.selection.targetDay}.`
            : `${item.title} already exists in "${result.selection.tripName}" - Day ${result.selection.targetDay}.`
        );
      });
    });

    createTripBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      const name = await askInputModal({
        title: 'Create New Trip',
        label: 'Enter new trip name',
        defaultValue: '',
      });
      if (!name || !String(name).trim()) return;
      const cleanName = String(name).trim();
      addTripName(cleanName);
      setState(TRIP_PLAN_SELECTED_KEY, cleanName);
      setTripMeta(cleanName, { status: 'Draft' });
      refreshTripSelector();
      renderActiveTripFromPlan();
      renderTripCards();
      refreshDayTargetOptions();
      selectDayCard(getDayCards()[0] || null);
      showToast('Trip created.');
    });

    softResetTripsBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const ok = window.confirm('Remove activities only and keep trip names/dates?');
      if (!ok) return;
      setState(PLAN_KEY, []);
      localStorage.removeItem('kemet-day-draft');
      renderActiveTripFromPlan();
      renderTripCards();
      refreshDayTargetOptions();
      selectDayCard(getDayCards()[0] || null);
      updateSuggestedHotelsForActiveTrip();
      syncSourceButtons();
      showToast('Activities cleared. Trip names and dates are kept.');
    });

    resetTripsBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const ok = window.confirm('Remove all your created trips and activities?');
      if (!ok) return;
      setState(PLAN_KEY, []);
      setState(TRIP_CATALOG_KEY, []);
      setState(TRIP_DATES_KEY, {});
      setState(TRIP_META_KEY, {});
      localStorage.removeItem(TRIP_PLAN_SELECTED_KEY);
      localStorage.removeItem('kemet-day-draft');
      refreshTripSelector();
      renderActiveTripFromPlan();
      renderTripCards();
      refreshDayTargetOptions();
      renderDraft();
      syncSourceButtons();
      updateSuggestedHotelsForActiveTrip();
      showToast('All trip planning data has been reset.');
    });

    tripNameSelect?.addEventListener('change', () => {
      setState(TRIP_PLAN_SELECTED_KEY, String(tripNameSelect.value || ''));
      if (tripDateInput) tripDateInput.value = getTripDate(tripNameSelect.value);
      renderActiveTripFromPlan();
      renderTripCards();
      refreshDayTargetOptions();
      selectDayCard(getDayCards()[0] || null);
      updateSuggestedHotelsForActiveTrip();
    });

    tripDateInput?.addEventListener('change', () => {
      const tripName = String(tripNameSelect?.value || getActiveTripName() || '').trim();
      if (!tripName) return;
      setTripDate(tripName, String(tripDateInput.value || ''));
      setTripMeta(tripName, { date: String(tripDateInput.value || '') });
      renderTripCards();
      showToast('Trip date updated.');
    });

    document.getElementById('day-draft-clear')?.addEventListener('click', (e) => {
      e.preventDefault();
      setDraftItems([]);
      renderDraft();
      syncSourceButtons();
    });

    document.getElementById('day-draft-confirm')?.addEventListener('click', (e) => {
      e.preventDefault();
      const items = getDraftItems();
      if (!items.length) return showToast('Add at least one item first.');
      const targetDay = Number(document.getElementById('day-target-select')?.value || 3);
      const selected =
        findDayCardByNumber(targetDay) ||
        ensureDayCard(targetDay);
      const host = selected.querySelector('[data-day-items]') || selected.querySelector('.space-y-3');
      if (!host) return;
      host.insertAdjacentHTML('beforeend', items.map(makeDayItemHtml).join(''));
      setDraftItems([]);
      renderDraft();
      syncSourceButtons();
      if (targetDay === 3 && dayPlaceholder) dayPlaceholder.classList.add('hidden');
      refreshDayTargetOptions();
      selectDayCard(selected);
      showToast('Day updated successfully.');
    });

    if (dayPlaceholder) {
      dayPlaceholder.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(routes.explore);
      });
    }

    getDayCards().forEach(bindDayCardControls);
    simplifySummaryCard();
    refreshTripSelector();
    renderActiveTripFromPlan();
    getDayCards().forEach(bindDayCardControls);
    renderDraft();
    syncSourceButtons();
    ensureDayTotalBox();
    refreshDayTargetOptions();
    renderTripCards();
    updateSuggestedHotelsForActiveTrip();
    document.getElementById('day-target-select')?.addEventListener('change', (e) => {
      const dayNumber = Number(e.target.value);
      const dayCard = findDayCardByNumber(dayNumber);
      if (dayCard) {
        selectDayCard(dayCard);
      } else {
        getDayCards().forEach((card) => card.classList.remove('ring-2', 'ring-primary/40'));
        updateSummaryForDayNumber(dayNumber);
      }
    });

    document.getElementById('book-selected-day-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const dayNumber = Number(document.getElementById('day-target-select')?.value || 1);
      const dayCard = findDayCardByNumber(dayNumber);
      const total = dayCard ? getDayTotal(dayCard) : 0;
      setState('kemet-selected-day-payment', { day: dayNumber, total });
      setState(BOOKING_MODE_KEY, 'day');
      navigate(routes.booking);
    });

    selectDayCard(findDayCardByNumber(Number(document.getElementById('day-target-select')?.value || 1)) || getDayCards()[0] || null);
  }

  async function wireHomePage() {
    const setupHeroPlannerFilter = () => {
      const heroSection =
        Array.from(document.querySelectorAll('section')).find((section) =>
          normalizeText(section.querySelector('h1')?.textContent || '').includes('whispers of the eternal nile')
        ) || document;

      const plannerInput =
        heroSection.querySelector('input[placeholder*="Where to"]') ||
        heroSection.querySelector('input[placeholder*="explorer"]');
      const startPlanningBtn = findButtonByText('start planning', heroSection);

      const cityNames = ['cairo', 'luxor', 'aswan', 'sharm el sheikh'];
      const cityButtons = Array.from(heroSection.querySelectorAll('button, a')).filter((btn) =>
        cityNames.some((city) => normalizeText(btn.textContent) === city)
      );
      let selectedCity = '';

      const setCityActive = (activeName) => {
        selectedCity = activeName || '';
        cityButtons.forEach((btn) => {
          const name = normalizeText(btn.textContent);
          if (name === selectedCity) {
            btn.classList.add('ring-2', 'ring-white/70', 'bg-white/30');
          } else {
            btn.classList.remove('ring-2', 'ring-white/70', 'bg-white/30');
          }
        });
      };

      cityButtons.forEach((btn) => {
        if (btn.dataset.homeCityBound === '1') return;
        btn.dataset.homeCityBound = '1';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const name = normalizeText(btn.textContent);
          setCityActive(selectedCity === name ? '' : name);
          const cityLabel = selectedCity || name;
          if (cityLabel) {
            navigate(`${routes.trips}?city=${encodeURIComponent(cityLabel)}`);
          }
        });
      });

      const goToExploreWithFilters = (e) => {
        e?.preventDefault?.();
        const q = String(plannerInput?.value || '').trim();
        const city = selectedCity || q;
        if (city) {
          navigate(`${routes.trips}?city=${encodeURIComponent(city)}`);
          return;
        }
        navigate(routes.trips);
      };

      startPlanningBtn?.addEventListener('click', goToExploreWithFilters);
      plannerInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          goToExploreWithFilters(e);
        }
      });
    };

    setupHeroPlannerFilter();

    findButtonByText('subscribe')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Subscribed successfully.');
    });

    const popularHost = document.getElementById('home-popular-places');
    const topHost = document.getElementById('home-top-experiences');
    const readyHost = document.getElementById('home-ready-journeys');
    if (!popularHost && !topHost && !readyHost) return;

    const setupSectionArrows = (sectionTitle, host, shouldCreate = false) => {
      if (!host) return;
      const section = Array.from(document.querySelectorAll('section')).find((sec) =>
        normalizeText(sec.querySelector('h2')?.textContent || '').includes(normalizeText(sectionTitle))
      );
      if (!section) return;

      let arrowsWrap = section.querySelector(`[data-section-arrows="${escapeHtml(sectionTitle)}"]`);
      if (!arrowsWrap && !shouldCreate) {
        const existingChevronButtons = Array.from(section.querySelectorAll('button')).filter((btn) => {
          const icon = normalizeText(
            `${btn.querySelector('span.material-symbols-outlined')?.textContent || ''} ${
              btn.querySelector('span.material-symbols-outlined')?.getAttribute('data-icon') || ''
            }`
          );
          return icon.includes('chevron_left') || icon.includes('chevron_right');
        });
        if (existingChevronButtons.length >= 2) {
          arrowsWrap = existingChevronButtons[0].parentElement;
          const [firstBtn, secondBtn] = existingChevronButtons;
          if (!firstBtn.hasAttribute('data-arrow-dir') || !secondBtn.hasAttribute('data-arrow-dir')) {
            const firstIsLeft = normalizeText(
              `${firstBtn.querySelector('span.material-symbols-outlined')?.textContent || ''} ${
                firstBtn.querySelector('span.material-symbols-outlined')?.getAttribute('data-icon') || ''
              }`
            ).includes('chevron_left');
            firstBtn.setAttribute('data-arrow-dir', firstIsLeft ? 'left' : 'right');
            secondBtn.setAttribute('data-arrow-dir', firstIsLeft ? 'right' : 'left');
          }
        }
      }
      if (!arrowsWrap && shouldCreate) {
        arrowsWrap = document.createElement('div');
        arrowsWrap.setAttribute('data-section-arrows', sectionTitle);
        arrowsWrap.className = 'flex gap-2 justify-end mt-4';
        arrowsWrap.innerHTML = `
          <button data-arrow-dir="left" class="p-2 border border-outline rounded-full hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
          </button>
          <button data-arrow-dir="right" class="p-2 border border-outline rounded-full hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
          </button>
        `;
        const heading = section.querySelector('h2');
        if (heading?.parentElement) {
          heading.parentElement.appendChild(arrowsWrap);
        } else {
          section.prepend(arrowsWrap);
        }
      }

      const leftBtn = arrowsWrap?.querySelector('[data-arrow-dir="left"]');
      const rightBtn = arrowsWrap?.querySelector('[data-arrow-dir="right"]');
      const scrollStep = () => Math.max(280, Math.round(host.clientWidth * 0.9));

      if (leftBtn && leftBtn.dataset.boundScroll !== '1') {
        leftBtn.dataset.boundScroll = '1';
        leftBtn.addEventListener('click', (e) => {
          e.preventDefault();
          host.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
        });
      }
      if (rightBtn && rightBtn.dataset.boundScroll !== '1') {
        rightBtn.dataset.boundScroll = '1';
        rightBtn.addEventListener('click', (e) => {
          e.preventDefault();
          host.scrollBy({ left: scrollStep(), behavior: 'smooth' });
        });
      }
    };

    setupSectionArrows('Popular Destinations', popularHost, false);
    setupSectionArrows('Top Experiences', topHost, false);
    setupSectionArrows('Ready Journeys', readyHost, true);

    const cardImage = (place) =>
      resolveImageUrl(
        Array.isArray(place?.images) && place.images.length
          ? place.images[0]
          : 'https://via.placeholder.com/1200x800?text=Kemet+Travel'
      );

    const toPlaceLink = (place) => `${routes.place}?id=${encodeURIComponent(place?._id || '')}`;
    const toTripLink = (trip) => `${routes.tripDetails}?id=${encodeURIComponent(trip?._id || '')}`;

    const renderPopular = (places) => {
      if (!popularHost) return;
      if (!places.length) {
        popularHost.innerHTML =
          '<div class="w-full text-center py-10 text-stone-500">No popular destinations available.</div>';
        return;
      }

      popularHost.innerHTML = places
        .map(
          (place) => `
            <a href="${toPlaceLink(place)}" class="min-w-[320px] md:min-w-[400px] group cursor-pointer block hover:-translate-y-1 transition-transform duration-300">
              <div class="relative h-[500px] overflow-hidden rounded-xl mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300">
                <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${escapeHtml(cardImage(place))}" alt="${escapeHtml(place?.name || 'Place')}"/>
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div class="absolute bottom-6 left-6 text-white">
                  <h3 class="font-h3 text-h3 mb-1">${escapeHtml(place?.name || 'Destination')}</h3>
                  <p class="text-stone-300 font-body-md">${escapeHtml(place?.location || 'Egypt')}</p>
                </div>
              </div>
            </a>
          `
        )
        .join('');
      applyImageFallbacks(popularHost);
    };

    const renderTop = (places) => {
      if (!topHost) return;
      if (!places.length) {
        topHost.innerHTML =
          '<div class="md:col-span-12 text-center py-12 text-stone-500">No top experiences available.</div>';
        return;
      }

      topHost.className = 'flex overflow-x-auto hide-scrollbar gap-gutter pb-6 -mx-8 px-8';
      topHost.innerHTML = places
        .map(
          (place) => `
            <a href="${toPlaceLink(place)}" class="relative rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300 min-h-[420px] min-w-[460px] md:min-w-[540px] block hover:-translate-y-1">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${escapeHtml(cardImage(place))}" alt="${escapeHtml(place?.name || 'Experience')}"/>
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent p-8 flex flex-col justify-end">
                <h4 class="font-h3 text-h3 mb-1 text-white">${escapeHtml(place?.name || 'Top Experience')}</h4>
                <p class="text-stone-200 text-sm">${escapeHtml(place?.location || 'Egypt')}</p>
              </div>
            </a>
          `
        )
        .join('');
      applyImageFallbacks(topHost);
    };

    const renderReadyJourneys = (trips) => {
      if (!readyHost) return;
      const readyOnly = (Array.isArray(trips) ? trips : []).filter((trip) => trip?.isReady === true);
      if (!readyOnly.length) {
        readyHost.innerHTML =
          '<div class="md:col-span-3 bg-white rounded-xl border border-stone-100 p-8 text-center text-stone-500">No ready journeys available.</div>';
        return;
      }

      readyHost.className = 'flex overflow-x-auto hide-scrollbar gap-gutter pb-6 -mx-8 px-8';
      readyHost.innerHTML = readyOnly
        .map((trip) => {
          const image = resolveImageUrl(
            (Array.isArray(trip?.images) && trip.images.length ? trip.images[0] : trip?.image) ||
              'https://via.placeholder.com/1200x800?text=Kemet+Trip'
          );
          const title = trip?.title || 'Untitled Journey';
          const duration = trip?.duration || 'Flexible';
          const price = Number(trip?.price || 0);

          return `
            <a href="${toTripLink(trip)}" class="bg-white rounded-xl shadow-sm overflow-hidden border border-stone-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block min-w-[400px] md:min-w-[500px]">
              <div class="h-80 relative">
                <img class="w-full h-full object-cover" src="${escapeHtml(image)}" alt="${escapeHtml(title)}"/>
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary font-bold text-sm">
                  ${escapeHtml(duration)}
                </div>
              </div>
              <div class="p-8">
                <h3 class="font-h3 text-h3 mb-4 text-on-surface">${escapeHtml(title)}</h3>
                <div class="flex justify-between items-center pt-6 border-t border-stone-100">
                  <div>
                    <span class="text-xs text-stone-400 block uppercase font-bold tracking-tighter">Starting from</span>
                    <span class="text-xl font-h3 text-primary">${formatMoney(price)}</span>
                  </div>
                  <span class="bg-[#C5A059] text-white p-3 rounded-lg active:scale-95 transition-transform inline-flex items-center">
                    <span class="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
                  </span>
                </div>
              </div>
            </a>
          `;
        })
        .join('');
      applyImageFallbacks(readyHost);
    };

    try {
      const popularPlaces = await api('/api/places?popular=true');
      renderPopular(Array.isArray(popularPlaces) ? popularPlaces : []);
    } catch (err) {
      if (popularHost) {
        popularHost.innerHTML =
          '<div class="w-full text-center py-10 text-red-600">Failed to load popular destinations.</div>';
      }
    }

    try {
      const topPlaces = await api('/api/places?top=true');
      renderTop(Array.isArray(topPlaces) ? topPlaces : []);
    } catch (err) {
      if (topHost) {
        topHost.innerHTML =
          '<div class="md:col-span-12 text-center py-12 text-red-600">Failed to load top experiences.</div>';
      }
    }

    try {
      const readyTrips = await api('/api/trips?ready=true', { cache: 'no-store' });
      renderReadyJourneys(Array.isArray(readyTrips) ? readyTrips : []);
    } catch (err) {
      if (readyHost) {
        readyHost.innerHTML =
          '<div class="md:col-span-3 bg-white rounded-xl border border-stone-100 p-8 text-center text-red-600">Failed to load ready journeys.</div>';
      }
    }
  }

  async function wireExplorePage() {
    const grid = document.getElementById('explore-place-grid');
    if (!grid) return;
    const queryParams = new URLSearchParams(window.location.search);
    const initialQuery = String(queryParams.get('q') || '').trim();
    const initialArea = String(queryParams.get('area') || '').trim();

    const exploreFab = document.getElementById('explore-plan-fab');
    if (exploreFab) {
      exploreFab.style.right = '96px';
      exploreFab.style.bottom = '20px';
      exploreFab.style.zIndex = '99990';
    }

    exploreFab?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.myTrip);
    });

    const countEl = document.getElementById('explore-count');
    const categoryChecks = Array.from(document.querySelectorAll('aside input[type="checkbox"]:not(#filter-popular):not(#filter-top-exp)'));
    const popularCheck = document.getElementById('filter-popular');
    const topExpCheck  = document.getElementById('filter-top-exp');
    const feeButtons   = Array.from(document.querySelectorAll('aside .fee-btn'));
    const resetBtn     = document.getElementById('reset-filters');
    const areaSelect = document.querySelector('aside select');
    const durationButtons = Array.from(document.querySelectorAll('aside h3'))
      .find((el) => normalizeText(el.textContent).includes('duration'))
      ?.parentElement?.querySelectorAll('button');
    const ratingRadios = Array.from(document.querySelectorAll('aside input[type="radio"][name="rating"]'));
    const sortSelect = Array.from(document.querySelectorAll('select')).find((el) =>
      Array.from(el.options).some((opt) => normalizeText(opt.textContent).includes('popularity'))
    );
    const searchInput =
      document.querySelector('input[placeholder*="Search"]') || document.querySelector('input[placeholder*="search"]');

    const getPlaceRating = (place) => Number(place?.rating ?? 0);
    const getPlaceFee = (place) => Number(place?.entryFee ?? 0);
    const getPlaceLocation = (place) => String(place?.location || 'Cairo');

    const toTripFromPlace = (place) => ({
      _id: `place-${place._id}`,
      title: place.name || 'Place',
      location: getPlaceLocation(place),
      duration: 'Visit',
      price: getPlaceFee(place),
      description: place.description || '',
      image: Array.isArray(place.images) ? place.images[0] : '',
      source: 'place',
      placeId: place._id,
    });

    const normalizeCategoryToken = (value) =>
      normalizeText(value).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

    const splitCategoryTokens = (value) =>
      String(value || '')
        .split(/[\/,&|]/g)
        .map((part) => normalizeCategoryToken(part))
        .filter(Boolean);

    const getLocationMeta = (place) => {
      const raw = String(getPlaceLocation(place) || '').trim();
      const parts = raw
        .split(/[,|/-]/g)
        .map((part) => part.trim())
        .filter(Boolean);
      const city = parts[0] || raw || 'Unknown';
      const region = parts.length > 1 ? parts[parts.length - 1] : city;
      return {
        raw,
        city,
        region,
        normalized: normalizeText(`${raw} ${city} ${region}`),
      };
    };

    const parseClockToHours = (timeText) => {
      const match = String(timeText || '')
        .trim()
        .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
      if (!match) return null;
      let hour = Number(match[1]);
      const minute = Number(match[2] || 0);
      const period = String(match[3] || '').toUpperCase();
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      return hour + minute / 60;
    };

    const estimateVisitDurationBucket = (place) => {
      const explicit = normalizeText(place?.visitDuration || place?.duration || '');
      if (explicit.includes('1-3') || explicit.includes('1 3') || explicit.includes('hours')) {
        const n = Number((explicit.match(/(\d+)/) || [])[1] || 0);
        if (n && n <= 3) return '1-3';
        if (n && n <= 6) return 'half';
        if (n > 6) return 'full';
      }
      if (explicit.includes('half')) return 'half';
      if (explicit.includes('full')) return 'full';

      const opening = String(place?.openingHours || '').trim();
      const timeParts = opening.match(/\d{1,2}(?::\d{2})?\s*(?:AM|PM)/gi) || [];
      if (timeParts.length >= 2) {
        const start = parseClockToHours(timeParts[0]);
        const end = parseClockToHours(timeParts[1]);
        if (Number.isFinite(start) && Number.isFinite(end)) {
          const diff = end >= start ? end - start : end + 24 - start;
          if (diff <= 3) return '1-3';
          if (diff <= 6) return 'half';
          return 'full';
        }
      }

      const fee = getPlaceFee(place);
      if (fee > 400) return 'full';
      if (fee > 150) return 'half';
      return '1-3';
    };

    try {
      const data = await api('/api/places');
      const places = Array.isArray(data) ? data : [];
      let selectedDuration = '';
    let selectedFee = '';

    // Wire fee buttons
    feeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.fee;
        if (selectedFee === val) {
          selectedFee = '';
          feeButtons.forEach((b) => {
            b.classList.remove('bg-secondary-container', 'text-on-secondary-container');
            b.classList.add('bg-surface-container', 'border', 'border-outline-variant', 'text-on-surface-variant');
          });
        } else {
          selectedFee = val;
          feeButtons.forEach((b) => {
            b.classList.remove('bg-secondary-container', 'text-on-secondary-container');
            b.classList.add('bg-surface-container', 'border', 'border-outline-variant', 'text-on-surface-variant');
          });
          btn.classList.remove('bg-surface-container', 'border', 'border-outline-variant', 'text-on-surface-variant');
          btn.classList.add('bg-secondary-container', 'text-on-secondary-container');
        }
        applyFilters();
      });
    });

    // Wire reset button
    resetBtn?.addEventListener('click', () => {
      categoryChecks.forEach((c) => (c.checked = false));
      ratingRadios.forEach((r) => (r.checked = false));
      if (popularCheck) popularCheck.checked = false;
      if (topExpCheck)  topExpCheck.checked  = false;
      if (areaSelect)   areaSelect.value     = 'all';
      if (searchInput)  searchInput.value    = '';
      selectedDuration = '';
      selectedFee      = '';
      feeButtons.forEach((b) => {
        b.classList.remove('bg-secondary-container', 'text-on-secondary-container');
        b.classList.add('bg-surface-container', 'border', 'border-outline-variant', 'text-on-surface-variant');
      });
      Array.from(durationButtons || []).forEach((b) => {
        b.classList.remove('bg-secondary-container', 'text-on-secondary-container');
        b.classList.add('bg-surface-container', 'border', 'border-outline-variant', 'text-on-surface-variant');
      });
      applyFilters();
    });

      const egyptGovernorates = [
        'Cairo','Giza','Alexandria','Dakahlia','Red Sea','Beheira','Fayoum','Gharbia','Ismailia','Menofia',
        'Minya','Qalyubia','New Valley','Suez','Aswan','Assiut','Beni Suef','Port Said','Damietta','Sharkia',
        'South Sinai','Kafr El Sheikh','Matrouh','Luxor','Qena','North Sinai','Sohag'
      ];

      const allLocationValues = Array.from(
        new Set(
          [...egyptGovernorates, ...places.flatMap((place) => {
            const meta = getLocationMeta(place);
            return [meta.region, meta.city].filter(Boolean);
          })]
        )
      ).sort((a, b) => String(a).localeCompare(String(b), 'en', { sensitivity: 'base' }));

      if (areaSelect) {
        const current = normalizeText(areaSelect.value || '');
        areaSelect.innerHTML = [
          '<option value="all">All Egypt</option>',
          ...allLocationValues.map((loc) => `<option value="${escapeHtml(loc)}">${escapeHtml(loc)}</option>`),
        ].join('');

        const preferredArea = normalizeText(initialArea || current || '');
        if (preferredArea && preferredArea !== 'all areas' && preferredArea !== 'all egypt' && preferredArea !== 'all') {
          const matched =
            allLocationValues.find((loc) => normalizeText(loc) === preferredArea) ||
            allLocationValues.find((loc) => normalizeText(loc).includes(preferredArea) || preferredArea.includes(normalizeText(loc)));
          if (matched) areaSelect.value = matched;
        }
      }

      if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
      }

      if (durationButtons && durationButtons.length) {
        Array.from(durationButtons).forEach((btn) => {
          if (btn.dataset.boundDuration === '1') return;
          btn.dataset.boundDuration = '1';
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const text = normalizeText(btn.textContent);
            const value = text.includes('1-3')
              ? '1-3'
              : text.includes('half')
              ? 'half'
              : text.includes('full')
              ? 'full'
              : '';

            if (selectedDuration === value) {
              selectedDuration = '';
              btn.classList.remove('bg-secondary-container', 'text-on-secondary-container');
              btn.classList.add('bg-surface-container', 'border', 'border-outline-variant', 'text-on-surface-variant');
            } else {
              selectedDuration = value;
              Array.from(durationButtons).forEach((otherBtn) => {
                otherBtn.classList.remove('bg-secondary-container', 'text-on-secondary-container');
                otherBtn.classList.add('bg-surface-container', 'border', 'border-outline-variant', 'text-on-surface-variant');
              });
              btn.classList.remove('bg-surface-container', 'border', 'border-outline-variant', 'text-on-surface-variant');
              btn.classList.add('bg-secondary-container', 'text-on-secondary-container');
            }
            applyFilters();
          });
        });
      }

      const renderPlaces = (items) => {
        const selectedAreaLabel =
          areaSelect && areaSelect.value && normalizeText(areaSelect.value) !== 'all'
            ? areaSelect.value
            : 'Egypt';
        if (countEl) countEl.textContent = `${items.length} attractions in ${selectedAreaLabel}`;
        if (!items.length) {
          grid.innerHTML = `
            <div class="md:col-span-2 bg-white rounded-xl border border-outline-variant p-8 text-center text-on-surface-variant">
              No places match the current filters.
            </div>
          `;
          return;
        }

        grid.innerHTML = items
          .map((place) => {
            const title = place.name || 'Place';
            const description = place.description || '';
            const rating = getPlaceRating(place);
            const ratingText = Number.isFinite(rating) ? rating.toFixed(1) : 'N/A';
            const image = resolveImageUrl(Array.isArray(place.images) && place.images.length ? place.images[0] : '');
            const fallbackImage = getPlaceImageFallback(place);

            return `
              <article data-open-place="${escapeHtml(place._id)}" class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-high flex flex-col group hover:shadow-md transition-all duration-300 cursor-pointer">
                <div class="relative h-64 overflow-hidden">
                  <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${escapeHtml(image)}" data-fallback-src="${escapeHtml(fallbackImage)}" alt="${escapeHtml(title)}"/>
                  <div class="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1">
                    <span class="material-symbols-outlined text-primary-container text-lg" data-icon="star" style="font-variation-settings: 'FILL' 1;">star</span>
                    <span class="text-sm font-bold text-on-surface">${escapeHtml(ratingText)}</span>
                  </div>
                </div>
                <div class="p-6 flex-grow flex flex-col">
                  <div class="flex justify-between items-start mb-2">
                    <h2 class="font-h3 text-h3 text-on-surface">${escapeHtml(title)}</h2>
                    <button data-save-place="${escapeHtml(place._id)}" class="text-primary hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined" data-icon="bookmark">bookmark</span>
                    </button>
                  </div>
                  <p class="font-body-md text-on-surface-variant mb-6 flex-grow">${escapeHtml(description)}</p>
                  <div class="flex items-center gap-gutter">
                    <button data-add-place="${escapeHtml(place._id)}" class="flex-grow bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-primary/90 active:scale-95 transition-all">Add to Trip</button>
                    <a href="${routes.place}?id=${encodeURIComponent(place._id)}" class="p-3 border-2 border-secondary text-secondary rounded-lg hover:bg-secondary-container transition-colors inline-flex">
                      <span class="material-symbols-outlined block" data-icon="visibility">visibility</span>
                    </a>
                  </div>
                </div>
              </article>
            `;
          })
          .join('');

        grid.querySelectorAll('[data-add-place]').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const place = places.find((p) => String(p._id) === String(btn.getAttribute('data-add-place')));
            if (!place) return;
            const result = await addTripToPlanWithSelection(toTripFromPlace(place), 1);
            if (result.cancelled) return;
            if (result.added) {
              showSuccess(
                `${place.name} added to "${result.selection.tripName}" - Day ${result.selection.targetDay}.`
              );
            } else {
              showToast(
                `${place.name} already exists in "${result.selection.tripName}" - Day ${result.selection.targetDay}.`
              );
            }
          });
        });

        grid.querySelectorAll('[data-save-place]').forEach((btn) => {
          btn.addEventListener('click', (e) => e.stopPropagation());
          const place = places.find((p) => String(p._id) === String(btn.getAttribute('data-save-place')));
          if (!place) return;
          bindSavedToggleButton(btn, {
            savedId: `place-${place._id}`,
            title: place.name || 'Destination',
            subtitle: getPlaceLocation(place),
            priceText: getPlaceFee(place) ? `${formatMoney(getPlaceFee(place))} entry` : '',
            ratingText: Number.isFinite(getPlaceRating(place)) ? getPlaceRating(place).toFixed(1) : '',
            image: resolveImageUrl(Array.isArray(place.images) && place.images.length ? place.images[0] : ''),
            source: 'explore',
            placeId: place._id,
          });
        });

        grid.querySelectorAll('[data-add-place]').forEach((btn) => {
          btn.addEventListener('click', (e) => e.stopPropagation());
        });

        grid.querySelectorAll('[data-open-place]').forEach((card) => {
          card.addEventListener('click', (e) => {
            if (e.target.closest('button, a, input, select, textarea, label')) return;
            const placeId = card.getAttribute('data-open-place');
            if (!placeId) return;
            navigate(`${routes.place}?id=${encodeURIComponent(placeId)}`);
          });
        });

        applyImageFallbacks(grid);
      };

      const applyFilters = () => {
        const selectedCategories = categoryChecks
          .filter((input) => input.checked)
          .map((input) => normalizeCategoryToken(input.closest('label')?.textContent || ''))
          .filter(Boolean);
        const areaRaw = normalizeText(areaSelect?.value || '');
        const area = areaRaw === 'all' || areaRaw.includes('all areas') || areaRaw.includes('all egypt') ? '' : areaRaw;
        const selectedRatingText =
          normalizeText(ratingRadios.find((r) => r.checked)?.closest('label')?.textContent || '');
        const minRatingMatch = selectedRatingText.match(/(\d+(?:\.\d+)?)\+/);
        const minRating = minRatingMatch ? Number(minRatingMatch[1]) : null;
        const sortBy = normalizeText(sortSelect?.value || 'popularity');
        const searchQuery = normalizeText(searchInput?.value || initialQuery || '');
        const onlyPopular = popularCheck?.checked || false;
        const onlyTopExp  = topExpCheck?.checked  || false;

        let filtered = places.filter((place) => {
          const categoryTokens = splitCategoryTokens(place.category || '');
          const locationMeta = getLocationMeta(place);
          const rating = getPlaceRating(place);
          const fee = getPlaceFee(place);
          const durationBucket = estimateVisitDurationBucket(place);
          const searchableText = normalizeText(
            [
              place?.name || '',
              place?.description || '',
              place?.category || '',
              place?.location || '',
              Array.isArray(place?.highlights) ? place.highlights.join(' ') : '',
              Array.isArray(place?.keywords)   ? place.keywords.join(' ')   : '',
            ].join(' ')
          );

          const categoryOk =
            !selectedCategories.length ||
            selectedCategories.some((selected) => {
              return categoryTokens.some(
                (token) => token === selected || token.includes(selected) || selected.includes(token)
              );
            });

          const areaOk     = !area || locationMeta.normalized.includes(area);
          const ratingOk   = minRating === null || (Number.isFinite(rating) && rating >= minRating);
          const durationOk = !selectedDuration || durationBucket === selectedDuration;
          const searchOk   = !searchQuery || searchableText.includes(searchQuery);
          const popularOk  = !onlyPopular || place?.isPopular === true;
          const topExpOk   = !onlyTopExp  || place?.isTopExperience === true;
          const feeOk      = !selectedFee
            ? true
            : selectedFee === 'free'    ? fee === 0
            : selectedFee === 'budget'  ? fee > 0 && fee < 300
            : selectedFee === 'premium' ? fee >= 300
            : true;

          return categoryOk && areaOk && ratingOk && durationOk && searchOk && popularOk && topExpOk && feeOk;
        });

        if (sortBy.includes('popularity')) {
          filtered = filtered.sort((a, b) => {
            const popularDiff = Number(!!b?.isPopular) - Number(!!a?.isPopular);
            if (popularDiff !== 0) return popularDiff;
            return getPlaceRating(b) - getPlaceRating(a);
          });
        } else if (sortBy.includes('highest rated')) {
          filtered = filtered.sort((a, b) => getPlaceRating(b) - getPlaceRating(a));
        } else if (sortBy.includes('lowest price')) {
          filtered = filtered.sort((a, b) => getPlaceFee(a) - getPlaceFee(b));
        } else if (sortBy.includes('newest')) {
          filtered = filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        renderPlaces(filtered);
      };

      applyFilters();
      [...categoryChecks, ...ratingRadios].forEach((input) => {
        input.addEventListener('change', applyFilters);
      });
      popularCheck?.addEventListener('change', applyFilters);
      topExpCheck?.addEventListener('change', applyFilters);
      areaSelect?.addEventListener('change', applyFilters);
      sortSelect?.addEventListener('change', applyFilters);
      searchInput?.addEventListener('input', applyFilters);
      searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyFilters();
        }
      });

      findButtonByText('discover more places')?.addEventListener('click', (e) => {
        e.preventDefault();
        applyFilters();
      });
    } catch (err) {
      grid.innerHTML = `
        <div class="md:col-span-2 bg-white rounded-xl border border-outline-variant p-8 text-center text-red-600">
          Failed to load places.
        </div>
      `;
      showToast(err.message || 'Failed to load places.');
    }
  }

  async function wirePlacePage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const titleEl = document.getElementById('place-title');
    const locationEl = document.getElementById('place-location');
    const categoryEl = document.getElementById('place-category');
    const ratingEl = document.getElementById('place-rating');
    const descriptionEl = document.getElementById('place-description');
    const entryFeeEl = document.getElementById('place-entry-fee');
    const openingHoursEl = document.getElementById('place-opening-hours');
    const visitDurationEl = Array.from(document.querySelectorAll('p.font-body-md.font-bold')).find((el) =>
      normalizeText(el.textContent).includes('hour')
    );
    const mainImageEl = document.getElementById('place-main-image');
    const thumbEls = ['place-thumb-1', 'place-thumb-2']
      .map((thumbId) => document.getElementById(thumbId))
      .filter(Boolean);
    const insiderTipsGrid = Array.from(document.querySelectorAll('section')).find((section) =>
      normalizeText(section.querySelector('h3')?.textContent || '').includes('insider tips')
    )?.querySelector('.grid');

    if (!id) {
      findButtonByText('add to trip')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Open a place from Explore first.');
      });
      return;
    }

    try {
      const place = await api(`/api/places/${encodeURIComponent(id)}`);
      const images = Array.isArray(place.images) ? place.images.filter(Boolean) : [];
      const fallbackPool = [
        getPlaceImageFallback(place),
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73f34?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=900&q=80',
      ];
      const safeImages = [...images, ...fallbackPool]
        .map(resolveImageUrl)
        .filter(Boolean)
        .filter((img, idx, arr) => arr.indexOf(img) === idx)
        .slice(0, 3);
      const placeFallbackImage = getPlaceImageFallback(place);
      const placeHighlights = Array.isArray(place.highlights)
        ? place.highlights.filter(Boolean)
        : [];
      const safeHighlights = placeHighlights.length ? placeHighlights : ['Contact us for info'];

      if (titleEl) titleEl.textContent = place.name || 'Place';
      if (locationEl) locationEl.textContent = place.location || 'Cairo, Egypt';
      if (categoryEl) categoryEl.textContent = (place.category || 'Attraction').toUpperCase();
      if (ratingEl) ratingEl.textContent = Number.isFinite(Number(place.rating)) ? Number(place.rating).toFixed(1) : 'N/A';
      if (descriptionEl) descriptionEl.textContent = place.description || 'No description available.';
      if (entryFeeEl) {
        entryFeeEl.textContent = Number.isFinite(Number(place.entryFee))
          ? `EGP ${Number(place.entryFee).toLocaleString('en-US')}`
          : 'Contact us for info';
      }
      if (openingHoursEl) openingHoursEl.textContent = place.openingHours || 'Contact us for info';
      if (visitDurationEl) {
        visitDurationEl.textContent = place.visitDuration || place.duration || 'Contact us for info';
      }
      if (mainImageEl) {
        mainImageEl.src = safeImages[0] || IMAGE_PLACEHOLDER;
        mainImageEl.dataset.fallbackSrc = placeFallbackImage;
      }

      thumbEls.forEach((thumb, index) => {
        const source = safeImages[index + 1] || safeImages[0] || IMAGE_PLACEHOLDER;
        thumb.src = source;
        thumb.dataset.fallbackSrc = placeFallbackImage;
        thumb.addEventListener('click', () => {
          if (mainImageEl) mainImageEl.src = source;
        });
      });

      if (insiderTipsGrid) {
        insiderTipsGrid.innerHTML = safeHighlights
          .slice(0, 4)
          .map(
            (tip, index) => `
              <div class="flex items-start space-x-4 ${index % 2 === 0 ? 'bg-tertiary-fixed/20' : 'bg-secondary-fixed/20'} p-6 rounded-xl">
                <span class="material-symbols-outlined ${index % 2 === 0 ? 'text-tertiary' : 'text-secondary'} mt-1" data-icon="${
                  index % 2 === 0 ? 'light_mode' : 'footprint'
                }">${index % 2 === 0 ? 'light_mode' : 'footprint'}</span>
                <div>
                  <p class="font-bold mb-1">${escapeHtml(index % 2 === 0 ? 'Highlight' : 'Recommended')}</p>
                  <p class="text-sm text-on-surface-variant">${escapeHtml(String(tip))}</p>
                </div>
              </div>
            `
          )
          .join('');
      }

      applyImageFallbacks(document);

      const placeTrip = {
        _id: `place-${place._id}`,
        title: place.name || 'Place',
        location: place.location || 'Cairo, Egypt',
        duration: 'Visit',
        price: Number(place.entryFee || 0),
        description: place.description || '',
        image: safeImages[0] || '',
        source: 'place',
        placeId: place._id,
      };

      findButtonByText('add to trip')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const result = await addTripToPlanWithSelection(placeTrip, 1);
        if (result.cancelled) return;
        if (result.added) {
          showSuccess(`${placeTrip.title} added to "${result.selection.tripName}" - Day ${result.selection.targetDay}.`);
        } else {
          showToast(`${placeTrip.title} already exists in "${result.selection.tripName}" - Day ${result.selection.targetDay}.`);
        }
      });

      const saveBtn = findButtonByText('save');
      if (saveBtn) {
        bindSavedToggleButton(saveBtn, {
          savedId: `place-${place._id}`,
          title: place.name || 'Destination',
          subtitle: place.location || 'Cairo',
          priceText: Number(place.entryFee || 0) ? `${formatMoney(place.entryFee)} entry` : '',
          ratingText: Number.isFinite(Number(place.rating)) ? Number(place.rating).toFixed(1) : '',
          image: safeImages[0] || '',
          source: 'place',
          placeId: place._id,
        });
      }

      const mapLocation = encodeURIComponent(place.name ? `${place.name}, ${place.location || 'Egypt'}` : place.location || 'Egypt');
      const mapContainer = document.querySelector('.h-48.bg-surface-container-highest');
      if (mapContainer) {
        const searchQuery = place.name ? `${place.name}, ${place.location || 'Egypt'}` : place.location || 'Egypt';
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'KemetTravel/1.0' } }
          );
          const geoData = await geoRes.json();
          if (geoData && geoData[0]) {
            const lat = parseFloat(geoData[0].lat);
            const lon = parseFloat(geoData[0].lon);
            const d = 0.012;
            const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
            mapContainer.innerHTML = `<iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}"
              class="w-full h-full border-0" allowfullscreen="" loading="lazy">
            </iframe>`;
          } else {
            throw new Error('not found');
          }
        } catch {
          // fallback: Cairo center
          mapContainer.innerHTML = `<iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=31.18,30.02,31.30,30.09&layer=mapnik"
            class="w-full h-full border-0" allowfullscreen="" loading="lazy">
          </iframe>`;
        }
      }

      findButtonByText('get directions')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://www.google.com/maps/search/?api=1&query=${mapLocation}`, '_blank');
      });
    } catch (err) {
      if (titleEl) titleEl.textContent = 'Place not found';
      if (descriptionEl) descriptionEl.textContent = 'We could not load this place right now.';
      showToast(err.message || 'Failed to load place details.');
    }
  }

  async function wireHotelsPage() {
    const listHost = document.getElementById('hotel-list');
    if (!listHost) return;

    const countEl = document.getElementById('hotel-count');
    const areaSelect = document.getElementById('hotel-filter-area');
    const priceSelect = document.getElementById('hotel-filter-price');
    const ratingSelect = document.getElementById('hotel-filter-rating');
    const mapSection = document.querySelector('main > section.hidden.lg\\:block');
    let leafletMap = null;
    let markerLayer = null;
    let activeMapCity = '';
    const EGYPT_GOVERNORATES = [
      'Cairo','Giza','Alexandria','Dakahlia','Red Sea','Beheira','Fayoum','Gharbia','Ismailia','Menofia','Minya',
      'Qalyubia','New Valley','Suez','Aswan','Assiut','Beni Suef','Port Said','Damietta','Sharkia','South Sinai',
      'Kafr El Sheikh','Matrouh','Luxor','Qena','North Sinai','Sohag'
    ];

    const cityCoordinates = {
      cairo: [30.0444, 31.2357],
      giza: [30.0131, 31.2089],
      aswan: [24.0889, 32.8998],
      luxor: [25.6872, 32.6396],
      alexandria: [31.2001, 29.9187],
      'sharm el sheikh': [27.9158, 34.33],
      hurghada: [27.2579, 33.8116],
      egypt: [26.8206, 30.8025],
    };

    const normalizeCityFilterValue = (raw) => {
      const text = normalizeText(String(raw || ''));
      if (!text) return '';
      const compact = text
        .replace(/governorate/g, '')
        .replace(/city/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      for (const key of Object.keys(cityCoordinates)) {
        if (compact.includes(key)) return key;
      }
      return compact.split(',')[0].trim();
    };

    const parseLatLngFromHotel = (hotel) => {
      const location = hotel?.location;
      if (location && typeof location === 'object') {
        const lat = Number(location.lat ?? location.latitude ?? hotel?.lat ?? hotel?.latitude);
        const lng = Number(location.lng ?? location.lon ?? location.longitude ?? hotel?.lng ?? hotel?.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
      }
      const city = normalizeText(getHotelCityName(hotel) || 'egypt');
      for (const key of Object.keys(cityCoordinates)) {
        if (city.includes(key)) return cityCoordinates[key];
      }
      return cityCoordinates.egypt;
    };

    const ensureLeafletMap = () => {
      if (!mapSection || typeof window.L === 'undefined') return null;
      let mapEl = document.getElementById('map');
      if (!mapEl) {
        mapSection.style.position = 'sticky';
        mapSection.style.top = '84px';
        mapSection.style.height = 'calc(100vh - 84px)';
        mapEl = document.createElement('div');
        mapEl.id = 'map';
        mapEl.className = 'absolute inset-4 z-20 shadow-xl';
        mapSection.appendChild(mapEl);
      }
      if (!leafletMap) {
        leafletMap = window.L.map(mapEl, { zoomControl: true }).setView(cityCoordinates.egypt, 6);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(leafletMap);
        markerLayer = window.L.layerGroup().addTo(leafletMap);
      }
      setTimeout(() => leafletMap.invalidateSize(), 0);
      return leafletMap;
    };

    const updateMapMarkers = (hotels) => {
      const map = ensureLeafletMap();
      if (!map || !markerLayer) return;
      markerLayer.clearLayers();
      const points = [];
      hotels.forEach((hotel) => {
        const coords = parseLatLngFromHotel(hotel);
        if (!coords) return;
        points.push(coords);
        const name = String(hotel?.name || hotel?.title || 'Hotel');
        const city = getHotelCityName(hotel) || 'Egypt';
        const price = Number(hotel?.pricePerNight ?? hotel?.price ?? 0);
        window.L.marker(coords)
          .bindPopup(
            `<div style="min-width:150px"><strong>${escapeHtml(name)}</strong><br>${escapeHtml(
              city
            )}<br>${escapeHtml(formatMoney(price))}/night</div>`
          )
          .on('click', () => {
            activeMapCity = normalizeCityFilterValue(city);
            if (areaSelect) {
              const options = Array.from(areaSelect.options || []);
              const matched = options.find((opt) => normalizeCityFilterValue(opt.value) === activeMapCity);
              if (matched) {
                areaSelect.value = matched.value;
              } else if (activeMapCity) {
                const fallbackLabel = activeMapCity.charAt(0).toUpperCase() + activeMapCity.slice(1);
                const opt = document.createElement('option');
                opt.value = fallbackLabel;
                opt.textContent = fallbackLabel;
                areaSelect.appendChild(opt);
                areaSelect.value = fallbackLabel;
              }
              activeMapCity = '';
              areaSelect.dispatchEvent(new Event('change', { bubbles: true }));
              return;
            }
            applyHotelFilters();
          })
          .addTo(markerLayer);
      });
      if (!points.length) {
        map.setView(cityCoordinates.egypt, 6);
      } else if (points.length === 1) {
        map.setView(points[0], 12);
      } else {
        map.fitBounds(window.L.latLngBounds(points), { padding: [40, 40] });
      }
      setTimeout(() => map.invalidateSize(), 0);
    };

    try {
      const data = await api('/api/hotels');
      const safeHotels = Array.isArray(data) ? data : [];
      const getHotelCity = (hotel) => getHotelCityName(hotel) || 'Egypt';
      const getHotelPrice = (hotel) => Number(hotel.pricePerNight ?? hotel.price ?? 0);
      const getHotelRating = (hotel) => Number(hotel.userRating ?? hotel.rating ?? 0);

      const fillAreaOptions = () => {
        if (!areaSelect) return;
        const dbCities = Array.from(
          new Set(
            safeHotels
              .map((h) => String(getHotelCity(h) || '').trim())
              .filter(Boolean)
          )
        );
        const merged = Array.from(new Set([...EGYPT_GOVERNORATES, ...dbCities])).sort((a, b) => a.localeCompare(b));
        const current = String(areaSelect.value || 'All Areas');
        areaSelect.innerHTML = ['All Areas', ...merged]
          .map((city) => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`)
          .join('');
        const keep = Array.from(areaSelect.options).find((o) => normalizeText(o.value) === normalizeText(current));
        if (keep) areaSelect.value = keep.value;
      };

      const fillPriceOptions = () => {
        if (!priceSelect) return;
        const current = String(priceSelect.value || 'All Prices');
        const ranges = [
          'All Prices',
          'Under $200',
          '$200 - $500',
          '$500 - $1000',
          '$1000 - $2000',
          '$2000 - $5000',
          '$5000 - $10000',
          '$10000+',
        ];
        priceSelect.innerHTML = ranges.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('');
        const keep = Array.from(priceSelect.options).find((o) => normalizeText(o.value) === normalizeText(current));
        if (keep) priceSelect.value = keep.value;
      };

      const renderHotels = (items) => {
        if (countEl) countEl.textContent = `${items.length} ${items.length === 1 ? 'hotel' : 'hotels'}`;

        if (!items.length) {
          listHost.innerHTML = `
            <div class="bg-white rounded-xl border border-outline-variant p-8 text-center text-on-surface-variant">
              No hotels match the current filters.
            </div>
          `;
          updateMapMarkers([]);
          return;
        }

        listHost.innerHTML = items
          .map((hotel) => {
            const hotelName = hotel.name || hotel.title || 'Hotel';
            const hotelPrice = getHotelPrice(hotel);
            const hotelCity = getHotelCity(hotel);
            const image = Array.isArray(hotel.images) && hotel.images.length ? hotel.images[0] : '';
            const rating = getHotelRating(hotel);
            const ratingText = Number.isFinite(rating) ? rating.toFixed(1) : 'N/A';

            return `
              <article class="flex flex-col md:flex-row gap-8 bg-white shadow-sm hover:shadow-lg transition-all p-4 rounded-lg overflow-hidden cursor-pointer" data-hotel-id="${escapeHtml(hotel._id)}">
                <div class="w-full md:w-2/5 h-64 overflow-hidden rounded">
                  <img class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" src="${escapeHtml(resolveImageUrl(image))}" alt="${escapeHtml(hotelName)}"/>
                </div>
                <div class="w-full md:w-3/5 flex flex-col justify-between py-2">
                  <div>
                    <div class="flex justify-between items-start">
                      <span class="font-label-caps text-label-caps text-secondary mb-2 tracking-widest uppercase">${escapeHtml(hotelCity)}</span>
                      <div class="flex items-center text-[#C5A059]">
                        <span class="material-symbols-outlined text-sm" data-icon="star" style="font-variation-settings: 'FILL' 1;">star</span>
                        <span class="font-body-md font-bold ml-1">${escapeHtml(ratingText)}</span>
                      </div>
                    </div>
                    <div class="flex items-start justify-between gap-3 mb-2">
                      <h3 class="font-h3 text-h3 text-on-surface">${escapeHtml(hotelName)}</h3>
                      <button data-save-hotel="${escapeHtml(hotel._id)}" class="text-primary hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined" data-icon="bookmark">bookmark</span>
                      </button>
                    </div>
                    <p class="font-body-md text-on-surface-variant line-clamp-2">${escapeHtml(hotel.description || '')}</p>
                  </div>
                  <div class="mt-6 flex items-center justify-between">
                    <div>
                      <span class="font-label-caps text-label-caps text-outline block">Starts from</span>
                      <span class="font-h3 text-h3 text-tertiary">${formatMoney(hotelPrice)}</span>
                      <span class="font-body-md text-outline">/night</span>
                    </div>
                    <div class="flex space-x-3">
                      <button data-add-hotel="${escapeHtml(hotel._id)}" class="px-4 py-2 border border-secondary text-secondary font-label-caps text-label-caps hover:bg-secondary-container transition-colors">Add to Trip</button>
                      <a href="${routes.hotelDetails}?id=${encodeURIComponent(hotel._id)}" class="px-6 py-2 bg-tertiary text-on-tertiary font-label-caps text-label-caps hover:bg-tertiary-container transition-colors shadow-md inline-flex items-center">View Details</a>
                    </div>
                  </div>
                </div>
              </article>
            `;
          })
          .join('');

        listHost.querySelectorAll('[data-add-hotel]').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const hotel = safeHotels.find((item) => String(item._id) === String(btn.getAttribute('data-add-hotel')));
            if (!hotel) return;
            const result = await addTripToPlanWithSelection(toPlanTripFromHotel(hotel), 1);
            if (result.cancelled) return;
            showSuccess(
              result.added
                ? `Hotel added to "${result.selection.tripName}" - Day ${result.selection.targetDay}.`
                : `Hotel already exists in "${result.selection.tripName}" - Day ${result.selection.targetDay}.`
            );
          });
        });

        listHost.querySelectorAll('[data-save-hotel]').forEach((btn) => {
          btn.addEventListener('click', (e) => e.stopPropagation());
          const hotel = safeHotels.find((item) => String(item._id) === String(btn.getAttribute('data-save-hotel')));
          if (!hotel) return;
          bindSavedToggleButton(btn, buildSavedItemFromHotel(hotel));
        });

        listHost.querySelectorAll('[data-hotel-id]').forEach((card) => {
          card.addEventListener('click', (e) => {
            if (e.target.closest('button, a, input, select, textarea, label')) return;
            const hotelId = card.getAttribute('data-hotel-id');
            if (!hotelId) return;
            navigate(`${routes.hotelDetails}?id=${encodeURIComponent(hotelId)}`);
          });
        });

        applyImageFallbacks(listHost);
        updateMapMarkers(items);
      };

      const getFilteredHotels = (cityOverride = '') => {
        const selectedArea = String(areaSelect?.value || 'All Areas').trim();
        const selectedPrice = String(priceSelect?.value || 'Price Range').trim();
        const selectedRating = String(ratingSelect?.value || 'Guest Rating').trim();
        const effectiveArea = String(cityOverride || activeMapCity || selectedArea).trim();

        const minRatingMatch = selectedRating.match(/(\d+(?:\.\d+)?)\+/);
        const minRating = minRatingMatch ? Number(minRatingMatch[1]) : null;

        return safeHotels.filter((hotel) => {
          const city = String(getHotelCity(hotel) || '');
          const price = getHotelPrice(hotel);
          const rating = getHotelRating(hotel);

          const cityNorm = normalizeText(city);
          const areaNorm = normalizeCityFilterValue(effectiveArea);
          const areaOk = areaNorm === 'all areas' || areaNorm === '' || cityNorm === areaNorm || cityNorm.includes(areaNorm);

          let priceOk = true;
          if (selectedPrice.includes('Under $200')) priceOk = price < 200;
          else if (selectedPrice.includes('$200 - $500')) priceOk = price >= 200 && price <= 500;
          else if (selectedPrice.includes('$500 - $1000')) priceOk = price > 500 && price <= 1000;
          else if (selectedPrice.includes('$1000 - $2000')) priceOk = price > 1000 && price <= 2000;
          else if (selectedPrice.includes('$2000 - $5000')) priceOk = price > 2000 && price <= 5000;
          else if (selectedPrice.includes('$5000 - $10000')) priceOk = price > 5000 && price <= 10000;
          else if (selectedPrice.includes('$10000+')) priceOk = price > 10000;

          const ratingOk = minRating === null || (Number.isFinite(rating) && rating >= minRating);
          return areaOk && priceOk && ratingOk;
        });
      };

      const applyHotelFilters = () => {
        renderHotels(getFilteredHotels());
      };

      ensureLeafletMap();
      fillAreaOptions();
      fillPriceOptions();
      renderHotels(safeHotels);

      [areaSelect, priceSelect, ratingSelect].forEach((select) => {
        select?.addEventListener('change', () => {
          if (select === areaSelect) activeMapCity = '';
          applyHotelFilters();
        });
        select?.addEventListener('input', applyHotelFilters);
      });

      const applyBtn = findButtonByText('apply filters') || findButtonByText('advanced filters');
      applyBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        applyHotelFilters();
        showToast('Filters applied.');
      });
    } catch (err) {
      if (countEl) countEl.textContent = '0 hotels';
      listHost.innerHTML = `
        <div class="bg-white rounded-xl border border-outline-variant p-8 text-center text-red-600">
          Failed to load hotels.
        </div>
      `;
      showToast(err.message || 'Failed to load hotels.');
    }
  }

  async function wireHotelDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const titleEl = document.getElementById('hotel-title');
    const breadcrumbTitleEl = document.getElementById('hotel-breadcrumb-title');
    const locationEl = document.getElementById('hotel-location');
    const descriptionEl = document.getElementById('hotel-description');
    const priceEl = document.getElementById('hotel-price');
    const ratingEl = document.getElementById('hotel-rating');
    const amenitiesEl = document.getElementById('hotel-amenities');
    const mainImageEl = document.getElementById('hotel-main-image');
    const thumbEls = ['hotel-thumb-1', 'hotel-thumb-2', 'hotel-thumb-3']
      .map((thumbId) => document.getElementById(thumbId))
      .filter(Boolean);
    const addToTripBtn = document.getElementById('hotel-add-to-trip');
    const bookNowBtn = document.getElementById('hotel-book-now');

    if (!id) {
      if (titleEl) titleEl.textContent = 'Hotel not found';
      if (descriptionEl) descriptionEl.textContent = 'Missing hotel id in URL.';
      showToast('Invalid hotel link.');
      return;
    }

    try {
      const data = await api(`/api/hotels/${encodeURIComponent(id)}`);
      const hotel = data;
      const images = Array.isArray(hotel.images) && hotel.images.length
        ? hotel.images
        : [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
          ];
      const safeImages = images.map(resolveImageUrl);

      const hotelName = hotel.name || hotel.title || 'Hotel';
      const hotelCity = getHotelLocationLabel(hotel);
      const hotelPrice = hotel.pricePerNight ?? hotel.price;
      const hotelRating = Number(hotel.userRating ?? hotel.rating);

      if (titleEl) titleEl.textContent = hotelName;
      if (breadcrumbTitleEl) breadcrumbTitleEl.textContent = hotelName || 'Hotel Details';
      if (locationEl) locationEl.textContent = hotelCity;
      if (descriptionEl) descriptionEl.textContent = hotel.description || 'No description available.';
      if (priceEl) priceEl.textContent = formatMoney(hotelPrice);

      // --- Nights Selector ---
      let selectedNights = 1;
      const nightsCountEl = document.getElementById('hotel-nights-count');
      const nightsSummaryEl = document.getElementById('hotel-nights-summary');
      const pricePerNightEl = document.getElementById('hotel-price-per-night');
      const totalPriceEl = document.getElementById('hotel-total-price');
      const nightsMinusBtn = document.getElementById('hotel-nights-minus');
      const nightsPlusBtn = document.getElementById('hotel-nights-plus');

      function updateNightsUI() {
        if (nightsCountEl) nightsCountEl.textContent = selectedNights;
        if (nightsSummaryEl) nightsSummaryEl.textContent = `${selectedNights} ${selectedNights === 1 ? 'night' : 'nights'}`;
        if (pricePerNightEl) pricePerNightEl.textContent = formatMoney(hotelPrice);
        if (totalPriceEl) totalPriceEl.textContent = formatMoney(hotelPrice * selectedNights);
        if (nightsMinusBtn) nightsMinusBtn.disabled = selectedNights <= 1;
      }

      nightsMinusBtn?.addEventListener('click', () => {
        if (selectedNights > 1) { selectedNights--; updateNightsUI(); }
      });
      nightsPlusBtn?.addEventListener('click', () => {
        if (selectedNights < 30) { selectedNights++; updateNightsUI(); }
      });

      updateNightsUI();
      // --- End Nights Selector ---

      if (ratingEl) {
        ratingEl.textContent = Number.isFinite(hotelRating) ? `${hotelRating.toFixed(1)} rating` : 'Hotel';
      }
      if (mainImageEl) mainImageEl.src = safeImages[0] || IMAGE_PLACEHOLDER;

      thumbEls.forEach((imgEl, index) => {
        if (index > 1) {
          const wrapper = imgEl.closest('.rounded-xl') || imgEl.parentElement;
          if (wrapper) wrapper.style.display = 'none';
          return;
        }
        const source = safeImages[index + 1] || safeImages[0] || IMAGE_PLACEHOLDER;
        imgEl.src = source;
        imgEl.addEventListener('click', () => {
          if (mainImageEl) mainImageEl.src = source;
        });
      });

      const checkinEl = document.getElementById('hotel-checkin-date');
      const checkoutEl = document.getElementById('hotel-checkout-date');
      const guestsEl = document.getElementById('hotel-guests-text');
      const mapImage = document.getElementById('hotel-map-image');
      const distKmEl = document.getElementById('hotel-distance-km');
      const distLandmarkEl = document.getElementById('hotel-distance-landmark');
      const walkEl = document.getElementById('hotel-walk-time');
      const driveEl = document.getElementById('hotel-drive-time');

      const activeTripName = getActiveTripName();
      const tripDateIso = getTripDate(activeTripName) || '';
      const checkIn = tripDateIso ? new Date(tripDateIso) : new Date();
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 3);
      const fmtDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (checkinEl) checkinEl.textContent = fmtDate(checkIn);
      if (checkoutEl) checkoutEl.textContent = fmtDate(checkOut);

      const travelers = Number(getSessionUser()?.travelers) > 0 ? Number(getSessionUser()?.travelers) : 2;
      if (guestsEl) guestsEl.textContent = `${travelers} Adults, 1 Room`;

      if (mapImage) mapImage.setAttribute('data-location', hotelCity);

      const landmark = String(hotel.nearestLandmark || hotelCity || 'City Center');
      const distKm = Number(hotel.distanceKm || hotel.distance || 0.7);
      const walkMin = Number(hotel.walkMinutes || Math.max(5, Math.round(distKm * 12)));
      const driveMin = Number(hotel.driveMinutes || Math.max(8, Math.round(distKm * 20)));
      if (distKmEl) distKmEl.textContent = `${(distKm * 1000).toFixed(0)} Meters`;
      if (distLandmarkEl) distLandmarkEl.textContent = `To ${landmark}`;
      if (walkEl) walkEl.textContent = `${walkMin} min to ${landmark}`;
      if (driveEl) driveEl.textContent = `${driveMin} min to ${landmark}`;

      applyImageFallbacks(document);

      if (amenitiesEl) {
        const amenities = Array.isArray(hotel.amenities) ? hotel.amenities.filter(Boolean) : [];
        amenitiesEl.innerHTML = amenities.length
          ? amenities.map((item) => `<span class="amenity-badge">${escapeHtml(item)}</span>`).join('')
          : '<span class="text-on-surface-variant">Amenities will be updated soon.</span>';
      }

      addToTripBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        const result = await addTripToPlanWithSelection(toPlanTripFromHotel(hotel, selectedNights), 1);
        if (result.cancelled) return;
        showSuccess(
          result.added
            ? `Hotel added to "${result.selection.tripName}" - Day ${result.selection.targetDay}.`
            : `Hotel already exists in "${result.selection.tripName}" - Day ${result.selection.targetDay}.`
        );
      });

      bookNowBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        const result = await addTripToPlanWithSelection(toPlanTripFromHotel(hotel, selectedNights), 1);
        if (!result.cancelled && result.added) {
          showSuccess(`Hotel added to "${result.selection.tripName}" - Day ${result.selection.targetDay}.`);
        }
        navigate(routes.myTrip);
      });
    } catch (err) {
      if (titleEl) titleEl.textContent = 'Hotel not found';
      if (descriptionEl) descriptionEl.textContent = 'We could not load this hotel right now.';
      showToast(err.message || 'Failed to load hotel details.');
    }
  }

  function wireConfirmationPage() {
    const sessionUser = getSessionUser() || {};
    const scopedPayment = getState(userScopedKey(LAST_PAYMENT_KEY, sessionUser.userId || 'guest'), null);
    const fallbackPayment = getState(LAST_PAYMENT_KEY, null);
    const payment = scopedPayment || fallbackPayment;
    const setById = (id, value) => {
      const el = document.getElementById(id);
      if (el && value !== undefined && value !== null && value !== '') el.textContent = String(value);
    };

    if (payment && typeof payment === 'object') {
      const confirmImageEl = document.getElementById('confirm-summary-image');
      const bookingIdEl = document.querySelector('p.font-body-lg span.font-bold');
      const titleEl = document.querySelector('.lg\\:col-span-7 h2.font-h2');
      const totalPaidEl = document.querySelector('.lg\\:col-span-7 p.text-h3.font-h3.text-primary');
      const badgeEl = document.querySelector('.lg\\:col-span-7 .absolute.top-4.left-4 span, .md\\:w-1\\/3 .absolute.top-4.left-4 span');
      const calendarDateEl = Array.from(document.querySelectorAll('.lg\\:col-span-7 .flex.items-center.gap-2 span')).find(
        (el) => !el.classList.contains('material-symbols-outlined') && /-|\/|,|date|oct|nov|dec|jan|feb|mar|apr|may|jun|jul|aug|sep/i.test(String(el.textContent || ''))
      );
      const travelersEl = Array.from(document.querySelectorAll('.lg\\:col-span-7 span.text-body-md.font-body-md')).find((el) =>
        /adult/i.test(String(el.textContent || ''))
      );

      if (bookingIdEl) bookingIdEl.textContent = payment.bookingId || bookingIdEl.textContent;
      if (titleEl && payment.title) titleEl.textContent = payment.title;
      if (totalPaidEl && Number.isFinite(Number(payment.totalPaid))) {
        totalPaidEl.textContent = formatMoney(Number(payment.totalPaid));
      }
      if (badgeEl && payment.tripDuration) badgeEl.textContent = payment.tripDuration;
      if (calendarDateEl) {
        calendarDateEl.textContent = payment.tripDateText || (payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : calendarDateEl.textContent);
      }
      if (travelersEl && payment.travelersText) travelersEl.textContent = payment.travelersText;
      if (confirmImageEl) {
        const selectedTripFromState = getState(SELECTED_TRIP_KEY, null);
        const preferredImage =
          payment.image ||
          (selectedTripFromState &&
          payment.tripId &&
          String(selectedTripFromState._id || '') === String(payment.tripId || '')
            ? getTripDisplayImage(selectedTripFromState)
            : '');
        if (preferredImage) confirmImageEl.src = resolveImageUrl(preferredImage);
      }
      setById('confirm-booking-id', payment.bookingId || '');
      setById('confirm-trip-title', payment.title || '');
      setById('confirm-total-paid', Number.isFinite(Number(payment.totalPaid)) ? formatMoney(Number(payment.totalPaid)) : '');
      setById('confirm-travelers', payment.travelersText || '');

      const detailsRows = Array.from(document.querySelectorAll('div, p, span')).filter((el) =>
        ['primary guest', 'phone', 'email', 'payment method', 'status'].includes(normalizeText(el.textContent || ''))
      );
      const setNextValue = (label, value) => {
        const labelEl = detailsRows.find((el) => normalizeText(el.textContent || '') === label);
        if (!labelEl || !value) return;
        const row = labelEl.closest('div.flex, div') || labelEl.parentElement;
        const candidates = row ? Array.from(row.querySelectorAll('p,span,div')).filter((x) => x !== labelEl) : [];
        const target = candidates[candidates.length - 1];
        if (target) target.textContent = value;
      };

      const traveler = payment.travelerDetails || {};
      setById('confirm-primary-guest', traveler.fullName || '');
      setById('confirm-email', traveler.email || '');
      setById('confirm-phone', traveler.phone || '');
      setById('confirm-payment-method', payment.paymentMethod ? String(payment.paymentMethod).toUpperCase() : 'CARD');
      setById('confirm-status', 'Confirmed');
      setById('confirm-paid-at', payment.paidAt ? new Date(payment.paidAt).toLocaleString() : '-');
      setNextValue('primary guest', traveler.fullName || '');
      setNextValue('phone', traveler.phone || '');
      setNextValue('email', traveler.email || '');
      setNextValue('payment method', payment.paymentMethod ? String(payment.paymentMethod).toUpperCase() : '');
      setNextValue('status', 'Confirmed');

      const mainCol = document.querySelector('.lg\\:col-span-7');
      if (mainCol && traveler.fullName) {
        let invoiceBox = document.getElementById('kemet-real-invoice-details');
        if (!invoiceBox) {
          invoiceBox = document.createElement('section');
          invoiceBox.id = 'kemet-real-invoice-details';
          invoiceBox.className = 'mt-6 p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest';
          mainCol.appendChild(invoiceBox);
        }
        invoiceBox.innerHTML = `
          <h3 class="text-lg font-bold mb-3">Invoice Details</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p><span class="text-outline">Customer:</span> <span class="font-semibold">${escapeHtml(traveler.fullName || '')}</span></p>
            <p><span class="text-outline">Email:</span> <span class="font-semibold">${escapeHtml(traveler.email || '')}</span></p>
            <p><span class="text-outline">Phone:</span> <span class="font-semibold">${escapeHtml(traveler.phone || '')}</span></p>
            <p><span class="text-outline">Payment:</span> <span class="font-semibold">${escapeHtml(
              payment.paymentMethod ? String(payment.paymentMethod).toUpperCase() : 'CARD'
            )}</span></p>
            <p><span class="text-outline">Status:</span> <span class="font-semibold text-green-700">Confirmed</span></p>
            <p><span class="text-outline">Paid At:</span> <span class="font-semibold">${
              payment.paidAt ? new Date(payment.paidAt).toLocaleString() : '-'
            }</span></p>
          </div>
        `;
      }
    }
    if (!payment || typeof payment !== 'object') {
      setById('confirm-primary-guest', sessionUser.name || '');
      setById('confirm-email', sessionUser.email || '');
      setById('confirm-phone', sessionUser.phone || '');
    }

    const downloadBtn = document.getElementById('download-invoice-btn');
    downloadBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const printable = document.getElementById('invoice-print-root') || document.body;
      const win = window.open('', '_blank', 'width=980,height=1200');
      if (!win) {
        showError('Please allow popups to download the invoice PDF.');
        return;
      }
      win.document.write(`
        <html><head><title>Kemet Invoice</title>
          <style>
            body{font-family:Arial,sans-serif;padding:24px;color:#1f1f1f}
            h1,h2,h3{margin:0 0 12px}
            .card{border:1px solid #ddd;border-radius:10px;padding:16px;margin-bottom:14px}
            .muted{color:#666}
          </style>
        </head><body>
          <h1>Kemet Travel - Invoice</h1>
          <div class="card">${printable.innerHTML}</div>
        </body></html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 300);
    });

    findLinkByText('view in dashboard')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.dashboard);
    });

    findLinkByText('return home')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(routes.home);
    });
  }

  function wireFallbackLinks() {
    document.querySelectorAll('a[href="#"]').forEach((a) => {
      if (a.dataset.wired === '1') return;
      a.dataset.wired = '1';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const label = a.textContent?.trim() || 'This section';
        if (normalizeText(label).includes('support')) {
          navigate(routes.support);
          return;
        }
        showToast(`${label} is connected.`);
      });
    });
  }
})();