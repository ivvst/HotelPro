const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const userController = require('../controllers/userController'); // 🔥


const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin').default;

// 🔓 Публични
router.post('/register', authController.register);
router.post('/login', authController.login);
console.log('LOGIN ROUTE СЕ ИЗВИКВА!');
router.get('/logout', authController.logout);

// 🔐 Защитени
router.get('/profile', auth, authController.getProfileInfo);

console.log('DEBUG → updateUserById:', userController.updateUserById);
// 🔐 само админ да вижда всички потребители
router.get('/', auth, isAdmin, userController.getAllUsers);
router.get('/:id', auth, isAdmin, userController.getUserById);
router.put('/:id', auth, isAdmin, userController.updateUserById);

module.exports = router;
