const router = require('express').Router();
const users = require('./users');
const themes = require('./themes');
const posts = require('./posts');
const likes = require('./likes');
const test = require('./test');
const { authController } = require('../controllers');

const cruise = require('./cruises'); // 👈 това добавяш
const guest = require('./guests');
const room = require('./rooms');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.use('/users', users);
router.use('/themes', themes)
router.use('/posts', posts);
router.use('/likes', likes);
router.use('/test', test);

// Добави този ред:
router.use('/cruises', cruise); // 👈 това казва /api/cruise
router.use('/guests', guest);
router.use('/rooms', room);

module.exports = router;
