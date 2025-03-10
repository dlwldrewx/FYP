const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access Denied. No token provided." });
        }

        const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = await User.findById(decoded.id).select("-password"); // Attach user data
        
        if (!req.user) {
            return res.status(401).json({ error: "User not found." });
        }

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ error: "Invalid token." });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired. Please log in again." });
        }
        res.status(500).json({ error: "Internal server error." });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Access Denied. Admins only." });
    }
    next();
};

module.exports = { authenticateUser, authorizeAdmin };
