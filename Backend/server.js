const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const eventRoutes = require('./routes/eventRoutes');
const chatRoutes = require('./routes/chat');
const crowdRoutes = require('./routes/crowdRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    family: 4, 
    serverSelectionTimeoutMS: 5000 
})
.then(() => console.log("✅ MongoDB Connected Successfully!"))
.catch(err => console.error("❌ MongoDB connection failed:", err.message));

// API Routes
app.get('/', (req, res) => res.json({ message: 'Beat-Tix Backend is Live' }));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/crowd', crowdRoutes);

// Error Handling
app.use((req, res, next) => {
    res.status(404);
    next(new Error(`Not Found - ${req.originalUrl}`));
});

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});