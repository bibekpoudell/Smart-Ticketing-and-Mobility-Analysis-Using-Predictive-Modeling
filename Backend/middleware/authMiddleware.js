const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token (Ensuring this matches your authController secret)
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_123');

            // 3. Attach user to request (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };