// router/guests.js
const express = require('express');
const mongoose = require('mongoose');
const Guest = require('../models/guest');
const Cruise = require('../models/cruise');
const router = express.Router();

// Лог за всички заявки в този router
router.use((req, res, next) => {
  console.log('[guests router]', req.method, req.originalUrl);
  next();
});

// 1) Статични маршрути
router.get('/ping', (req, res) => {
  console.log('[guests] /ping OK');
  res.json({ ok: true, scope: 'guests' });
});

router.get('/debug', (req, res) => {
  res.json({ route: '/api/guests/debug', query: req.query });
});

// 2) Списък гости с опционален филтър по excursionId
router.get('/', async (req, res) => {
  try {
    const { excursionId } = req.query;
    const filter = {};
    if (excursionId) {
      filter.excursions = {
        $elemMatch: {
          _id: mongoose.isValidObjectId(excursionId)
            ? new mongoose.Types.ObjectId(excursionId)
            : excursionId
        }
      };
    }
    const guests = await Guest.find(filter).lean();
    res.json(guests);
  } catch (err) {
    console.error('Error fetching guests list:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3) GET по валидно ObjectId
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).lean();
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    console.error('Error fetching guest:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4) POST - създаване на гост
router.post('/', async (req, res) => {
  try {
    const newGuest = new Guest(req.body);
    await newGuest.save();
    res.status(201).json(newGuest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5) PUT - обновяване на гост
router.put('/:id([0-9a-fA-F]{24})', async (req, res) => {
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

// 6) DELETE - изтриване на гост
router.delete('/:id([0-9a-fA-F]{24})', async (req, res) => {
  try {
    const deleted = await Guest.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: 'Guest not found' });
    res.json({ message: 'Guest deleted' });
  } catch (err) {
    console.error('Error deleting guest:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 7) PATCH - добавяне на екскурзия към гост
router.patch('/:guestId([0-9a-fA-F]{24})/excursions', async (req, res) => {
  try {
    const { _id, name } = req.body;
    if (!_id || !name) return res.status(400).json({ error: 'Missing excursion _id or name' });

    const guest = await Guest.findById(req.params.guestId);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    // вече записан?
    if ((guest.excursions || []).some(ex => String(ex?._id) === String(_id))) {
      return res.json(guest);
    }

    let addedToWaitlist = false;

    if (guest.cruiseId) {
      const cruise = await Cruise.findById(guest.cruiseId).catch(() => null);
      const ex = cruise?.excursions.id(_id);

      if (ex) {
        const cap = Number(ex.capacity || 0);

        // колко са реално записани
        const enrolled = await Guest.countDocuments({
          cruiseId: guest.cruiseId,
          'excursions._id': ex._id
        });

        if (cap > 0 && enrolled >= cap) {
          // ПЪЛНО → добавяме в чакащи (ако не е там)
          ex.waitlist = ex.waitlist || [];
          const alreadyWaiting = ex.waitlist.some(w => String(w.guestId) === String(guest._id));
          if (!alreadyWaiting) {
            ex.waitlist.push({
              guestId: guest._id,
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email
            });
            await cruise.save();
          }
          addedToWaitlist = true;
        } else {
          // ИМА МЯСТО → преди записване, махни от waitlist ако фигурира
          if (Array.isArray(ex.waitlist) && ex.waitlist.length) {
            ex.waitlist = ex.waitlist.filter(w => String(w.guestId) !== String(guest._id)); // ← ТУК
            await cruise.save(); // ← ТУК
          }
        }
      }
    }

    if (!addedToWaitlist) {
      guest.excursions = guest.excursions || [];
      guest.excursions.push({ _id, name });
      await guest.save();
    }

    return res.json(guest);
  } catch (err) {
    console.error('[PATCH excursions] error:', err);
    return res.status(400).json({ error: err.message || 'Bad Request' });
  }
});


// 8) DELETE - премахване на екскурзия от гост
router.delete('/:guestId([0-9a-fA-F]{24})/excursions/:excursionId([0-9a-fA-F]{24})', async (req, res) => {
  try {
    const { guestId, excursionId } = req.params;
    const guest = await Guest.findById(guestId);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    const before = (guest.excursions || []).length;
    guest.excursions = (guest.excursions || []).filter(
      e => String(e?._id) !== String(excursionId)
    );
    const after = guest.excursions.length;

    if (before === after) {
      return res.status(404).json({ error: 'Excursion not found for this guest' });
    }

    await guest.save();
    const updated = await Guest.findById(guestId).lean();
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error in DELETE excursion:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
