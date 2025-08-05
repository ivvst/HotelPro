const mongoose = require('mongoose');

// екскурзията:
const excursionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  date: { type: String, required: true },      // напр. '2025-09-05'
  fromTime: { type: String, required: true },  // напр. '10:00'
  toTime: { type: String, required: true },   // напр. '14:00'
  deleteRequested: { type: Boolean, default: false }
});

// Схема за круиз:
const cruiseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: String, required: true }, // напр. '2025-09-01'
  endDate: { type: String, required: true },   // напр. '2025-09-08'
  excursions: [excursionSchema] // <--- вграден масив от екскурзии
});

module.exports = mongoose.model('Cruise', cruiseSchema);
