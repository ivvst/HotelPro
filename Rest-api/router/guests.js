// router/guests.js
const express = require('express');
const Guest = require('../models/guest');
const router = express.Router();

// GET  /api/guests    — върни всички гости
router.get('/', async (req, res) => {
  try {
    const guests = await Guest.find().lean();
    res.json(guests);
  } catch (err) {
    console.error('Error fetching guests:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET  /api/guests/:id — върни един гост по _id
router.get('/:id', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).lean();
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    console.error('Error fetching guest:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/guests    — създай нов гост
router.post('/', async (req, res) => {
  try {
    const newGuest = new Guest(req.body);
    await newGuest.save();
    res.status(201).json(newGuest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




// PUT  /api/guests/:id — обнови съществуващ гост
router.put('/:id', async (req, res) => {
  try {
    const updated = await Guest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'Guest not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating guest:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/guests/:id — изтрий гост
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Guest.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: 'Guest not found' });
    res.json({ message: 'Guest deleted' });
  } catch (err) {
    console.error('Error deleting guest:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//Extend for Excursions
// PATCH /api/guests/:guestId/excursions
router.patch('/:guestId/excursions', async (req, res) => {
  try {
    const { excursionId } = req.body;
    const guest = await Guest.findById(req.params.guestId);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    if (!guest.excursions.includes(excursionId)) {
      guest.excursions.push(excursionId);
      await guest.save();
    }

    res.json(guest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// DELETE /api/guests/:guestId/excursions/:excursionId
router.delete('/:guestId/excursions/:excursionId', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.guestId);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    const before = guest.excursions.length;
    guest.excursions = guest.excursions.filter(
      e => e !== req.params.excursionId
    );
    const after = guest.excursions.length;

    if (before === after) {
      return res.status(404).json({ message: 'Excursion not found for this guest.' });
    }

    await guest.save();

    res.json({ message: 'Екскурзията беше успешно премахната от госта!', guest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




module.exports = router;
