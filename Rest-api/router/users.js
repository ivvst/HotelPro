const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth } = require('../utils');

const { isAdmin } = require('../utils/roles');
const userController = require('../controllers/userController'); // 🔹 добави това

// 🔓 Публични
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// 🔐 Защитени
router.get('/profile', auth(), authController.getProfileInfo);
router.put('/profile', auth(), authController.editProfileInfo);

// 🔐 само админ да вижда всички потребители
router.get('/', auth(), isAdmin(), userController.getAllUsers);

module.exports = router;
