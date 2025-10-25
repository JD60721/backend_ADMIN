const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: Object }],
  createdAt: { type: Date, default: Date.now },
}, { collection: 'inventories' });

module.exports = mongoose.model('Inventory', inventorySchema);