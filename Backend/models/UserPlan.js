const mongoose = require('mongoose');

const userPlanSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    data: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('UserPlan', userPlanSchema);
