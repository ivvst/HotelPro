const router = require('express').Router();
const Vip = require('../models/vip');
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin').default;


router.get('/', async (req, res) => { res.json(await Vip.find().sort({ name: 1 })) });

router.post('/', auth, isAdmin, async (req, res) => {
    try {
        const name = String(req.body?.name || '').trim();
        if (!name) return res.status(400).json({ message: 'Missing name' });

        const exists = await Vip.findOne({ name });
        if (exists) return res.status(409).json({ message: 'Service already exists' });

        const created = await Vip.create({ name });
        return res.status(201).json(created);   // 👈 важно!
    } catch (e) {
        console.error('VIPS POST error:', e);
        return res.status(500).json({ message: e.message || 'Server error' });
    }
});

module.exports = router; // <= да не липсва!


