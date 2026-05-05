const mongoose = require('mongoose');

const chatEntrySchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: {
      type: [chatEntrySchema],
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
