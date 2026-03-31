const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT - Added a fallback for the secret to prevent crashes
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_123', { 
        expiresIn: '7d' 
    });
};

// Register User
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // 2. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Create user (This triggers the .pre('save') hook in User.js)
        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        console.error("Registration Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. Check if user exists AND password matches
        // matchPassword comes from your User.js model methods
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login
};