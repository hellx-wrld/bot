const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  lastInterest: { type: Number, default: 0 },
});

module.exports = mongoose.model('Bank', bankSchema);
