const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    title: { type: String, trim: true },
    location: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: { type: String, required: true, trim: true },
    pricePerNight: { type: Number, min: 0 },
    price: { type: Number, min: 0 },
    currency: { type: String, default: 'EGP' },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    userRating: { type: Number, min: 0, max: 5 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hotel', hotelSchema);
