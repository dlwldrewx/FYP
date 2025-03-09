// routes/userRoutes.js
const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateUser } = require('../middleware/authMiddleware');
const router = express.Router();

// 🟢 Get All Users (Admin Feature)
router.get('/all', authenticateUser, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 Get User Profile
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 Update User Profile
router.put('/profile', authenticateUser, async (req, res) => {
    try {
        const { name, email, username } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { name, email, username },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 Change Password
router.put('/change-password', authenticateUser, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await argon2.verify(user.password, oldPassword);
        if (!isMatch) return res.status(400).json({ error: 'Old password is incorrect' });

        user.password = await argon2.hash(newPassword);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 Delete Account
router.delete('/delete', authenticateUser, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.userId);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
