const mongoose = require('mongoose');

// Map to existing 'users' collection in 'test' DB
const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  passwordHash: { type: String },
}, { timestamps: true, collection: 'users' });

module.exports = mongoose.model('User', userSchema);