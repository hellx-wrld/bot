const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  quest: { type: String, required: true },
  completed: { type: Boolean, default: false },
  reward: { type: Number, default: 0 },
  timestamp: { type: Number, default: 0 },
});

module.exports = mongoose.model('Quest', questSchema);
