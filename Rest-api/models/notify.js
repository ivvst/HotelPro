const mongoose = require('mongoose');

const notifySchema = new mongoose.Schema({
  text: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  done: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notify', notifySchema);
