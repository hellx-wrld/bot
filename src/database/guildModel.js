const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '..' },
  lang: { type: String, default: 'id' }, // multi-bahasa
});

module.exports = mongoose.model('Guild', guildSchema);
