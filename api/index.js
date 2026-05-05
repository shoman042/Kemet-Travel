const app = require('../Backend/server.js');
const mongoose = require('mongoose');

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Ensure MongoDB is connected before processing request
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connection.asPromise();
    } catch (err) {
      console.error('MongoDB connection failed:', err.message);
      return res.status(503).json({ message: 'Database unavailable. Please try again.' });
    }
  }
  return app(req, res);
};
