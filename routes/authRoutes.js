const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure correct path
const router = express.Router();

// ✅ Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, username, password, role } = req.body;

        // Prevent users from assigning themselves as admin
        const userRole = 'user';

        // Check if email or username is already taken
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ error: "Email or username already taken" });

        // Create new user
        const newUser = new User({ name, email, username, password, role: userRole });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", role: userRole });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// ✅ Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});


// Export the router properly
module.exports = router;
