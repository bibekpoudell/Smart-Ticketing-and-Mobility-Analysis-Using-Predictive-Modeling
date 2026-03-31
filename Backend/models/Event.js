const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // 1. CHANGED: title -> eventName to match your controller and chatbot
    eventName: { 
        type: String, 
        required: [true, "Event name is required"], 
        trim: true 
    },
    description: { 
        type: String, 
        required: [true, "Description is required"] 
    },
    posterUrl: { 
        type: String, 
        required: [true, "Poster image is required"] 
    },
    artist: { 
        type: String, 
        required: [true, "Artist name is required"] 
    },
    genre: { 
        type: String, 
        enum: ['Rock', 'Pop', 'EDM', 'Jazz', 'Classical', 'Hip-Hop', 'Other'],
        default: 'Other'
    },
    date: { 
        type: Date, 
        required: [true, "Event date is required"] 
    },
    venue: { 
        type: String, 
        required: [true, "Venue name is required"] 
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [85.3240, 27.7172] } // Default for Kathmandu
    },
    totalTickets: { 
        type: Number, 
        required: [true, "Total ticket capacity is required"] 
    },
    ticketsSold: { 
        type: Number, 
        default: 0 
    },
    basePrice: { 
        type: Number, 
        required: [true, "Base price is required"] 
    },
    currentPrice: { 
        type: Number, 
        required: [true, "Current price is required"] 
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Sold Out', 'Cancelled'],
        default: 'Upcoming'
    }
}, { timestamps: true });

// Index for location-based searches (useful for Nepal-based event discovery)
eventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);