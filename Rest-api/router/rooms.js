// router/rooms.js
const express = require('express');
const Room    = require('../models/room');
const router  = express.Router();

router.get('/', async (req, res) => {
  try {
    // само number и deck
    const rooms = await Room.find({}, 'number deck').lean();
    res.json(rooms);
  } catch (err) {
    console.error('Failed to fetch rooms:', err);
    res.status(500).json({ error: 'Unable to load rooms' });
  }
});
// DELETE /api/rooms/:id — изтрий стая
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
