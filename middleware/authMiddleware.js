const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password"); // Attach user data to request

        if (!req.user) return res.status(401).json({ error: "User not found." });

        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access Denied. Admins only." });
    }
    next();
};

module.exports = { authenticateUser, authorizeAdmin };