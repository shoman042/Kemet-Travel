const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  loyaltyPoints: { type: Number, default: 0 },
  resetOtp: { type: String, default: '' },
  resetOtpExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// ✅ شفّر الباسورد تلقائياً قبل الحفظ
// ✅ الكود الصح
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ✅ method للمقارنة عند اللوجين
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ إخفاء الباسورد والـ OTP من أي response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetOtp;
  delete user.resetOtpExpiresAt;
  return user;
};

module.exports = mongoose.model('User', userSchema);