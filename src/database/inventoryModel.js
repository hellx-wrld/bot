const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  item: { type: String, required: true },
  quantity: { type: Number, default: 0 },
});

inventorySchema.index({ userId: 1, item: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
