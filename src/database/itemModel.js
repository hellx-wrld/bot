const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  stock: { type: Number, default: 0 },
});

module.exports = mongoose.model('Item', itemSchema);
