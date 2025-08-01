const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = 'mySuperSecretKey'; // по-късно сложи в .env

// Регистрация
router.post('/register', async (req, res) => {
    const { email, password, repeatPassword, username, fullName } = req.body;

    try {
        if (password !== repeatPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            username,
            fullName
        });

        const token = jwt.sign({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'mysecret', {
            expiresIn: '2h'
        });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 2 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'User registered',
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                fullName: user.fullName
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});

// Вход
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { _id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'mysecret',
            { expiresIn: '2h' }
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 2 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.status(204).json({ message: 'Logged out' });
});

module.exports = router;
