const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 },
  lastWork: { type: Number, default: 0 },
  email: { type: String, default: '' },
  bio: { type: String, default: '' },
});

module.exports = mongoose.model('User', userSchema);
