const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, required: true }, // e.g. 'admin', 'mod', 'user'
});

module.exports = mongoose.model('Role', roleSchema);
