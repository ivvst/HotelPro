// modules/room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  deck:   { type: String, enum: ['main','rhine'], required: true }
}, {
  timestamps: false   // ако не искаш createdAt/updatedAt
});

module.exports = mongoose.model('room', roomSchema);
