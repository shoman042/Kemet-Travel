const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    category: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    entryFee: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    openingHours: { type: String, default: '', trim: true },
    isPopular: { type: Boolean, default: false },
    isTopExperience: { type: Boolean, default: false },
    images: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Place', placeSchema);
