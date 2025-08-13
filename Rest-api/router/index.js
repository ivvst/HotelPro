const router = require('express').Router();

const users = require('./users');
const notifies = require('./notifies');



const themes = require('./themes');
const posts = require('./posts');
const likes = require('./likes');
const test = require('./test');
const { authController } = require('../controllers');

const cruise = require('./cruises');
const guest = require('./guests');
const vip = require('./vips');
const room = require('./rooms');

// Auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Модули
router.use('/users', users);
router.use('/notify', notifies);


router.use('/themes', themes);
router.use('/posts', posts);
router.use('/likes', likes);
router.use('/test', test);

router.use('/cruises', cruise);
router.use('/guests', guest);
router.use('/rooms', room);
router.use('/vips', vip);

// Статични маршрути – след модулите
router.get('/ping', (req, res) => res.json({ ok: true }));
router.get('/debug', (req, res) => res.json({ route: '/debug', query: req.query }));

module.exports = router;
