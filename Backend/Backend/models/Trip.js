const mongoose = require('mongoose');

// تعريف شكل البيانات (الـ Schema)
const tripSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    currency: {
        type: String,
        default: 'USD'
    },
    rating: {
        type: Number,
        default: 0
    },
    isReady: {
        type: Boolean,
        default: false
    },
    image: { 
        type: String, 
        default: 'https://via.placeholder.com/400' 
    },
    images: {
        type: [String],
        default: []
    },
    description: {
        type: String
    },
    itinerary: {
        type: [String],
        default: []
    },
    includedServices: {
        type: [String],
        default: []
    },
    included: {
        type: [String],
        default: []
    }
}, { 
    timestamps: true // بيضيف لوحده تاريخ الإنشاء والتعديل
});

// تصدير الموديل عشان نستخدمه في server.js
module.exports = mongoose.model('Trip', tripSchema);
