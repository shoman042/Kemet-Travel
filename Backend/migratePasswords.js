/**
 * ملف migration — شغّله مرة واحدة بس
 * يشفر كل الباسوردات الموجودة في الداتابيز
 * 
 * شغّله بالأمر ده:
 *   node migratePasswords.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// ⚠️ غير المسار ده لو User.js في مكان تاني
const User = require('./models/User');

async function migratePasswords() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const users = await User.find({});
  console.log(`Found ${users.length} users`);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    // لو الباسورد مش مشفر (bcrypt هاش بيبدأ بـ $2b$ وبيكون 60 حرف)
    const isAlreadyHashed = String(user.password).startsWith('$2b$') || String(user.password).startsWith('$2a$');
    
    if (!isAlreadyHashed) {
      const hashed = await bcrypt.hash(user.password, 12);
      await User.updateOne({ _id: user._id }, { $set: { password: hashed } });
      console.log(`🔒 Migrated: ${user.email}`);
      migrated++;
    } else {
      console.log(`⏭️  Already hashed: ${user.email}`);
      skipped++;
    }
  }

  console.log('\n=============================');
  console.log(`✅ Done! Migrated: ${migrated} | Skipped: ${skipped}`);
  console.log('=============================\n');
  
  await mongoose.disconnect();
}

migratePasswords().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
