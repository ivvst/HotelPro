// modules/guest.js
const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  roomNumber: { type: Number, required: true },
  birthDate: { type: String, required: true },
  nationality: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  stayFrom: { type: String, required: true },
  stayTo: { type: String, required: true },
 cruiseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cruise', required: true },
  excursions: { type: [String], default: [] },
  isVIP: { type: Boolean, default: false },
  vipServices: { type: [String], default: [] },
  isRhc: { type: Boolean, default: false },
  picture: { type: String, default: "" }
}, {
  timestamps: true,     // adds createdAt & updatedAt
  versionKey: false     // ← if you don’t want __v
});

module.exports = mongoose.model('Guest', guestSchema);
