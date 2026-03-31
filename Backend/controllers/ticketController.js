// ticketController.js

const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const QRCode = require("qrcode");
const mongoose = require("mongoose");
const axios = require("axios");

// ==========================================
// 🛠️ DEMO CONFIGURATION (FOR SIMULATION)
// ==========================================
const DEMO_DATE = new Date("2026-03-30");

// ------------------------------------------
// Helper: Get Hybrid Price Multiplier (ML + Rule-based)
// ------------------------------------------
async function getHybridMultiplier(occupancyRate, daysUntilEvent, daysSinceCreated, ruleMultiplier) {
    try {
        // Call ML API
        const res = await axios.post("http://localhost:5001/predict-multiplier", {
            occupancy_rate_at_booking: occupancyRate,
            days_until_event: daysUntilEvent,
            days_since_created: daysSinceCreated,
            rule_based_multiplier: ruleMultiplier
        });

        const mlMultiplier = res.data.predicted_multiplier;

        // Average ML + Rule-based
        const hybridMultiplier = (mlMultiplier + ruleMultiplier) / 2;

        return hybridMultiplier;
    } catch (err) {
        console.error("ML API Error:", err.message);
        // fallback to rule-based if ML fails
        return ruleMultiplier;
    }
}

// ==========================================
// @desc    Book a ticket with Hybrid Dynamic Pricing
// @route   POST /api/tickets/book
// ==========================================
exports.bookTicket = async (req, res) => {
    try {
        const { eventId, quantity } = req.body;
        const qty = parseInt(quantity) || 1;
        const userId = req.user ? req.user.id : req.body.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "Valid Event ID and User ID are required." });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // --- 1. TIME VARIABLES ---
        const now = DEMO_DATE;
        const eventDate = new Date(event.date);
        const createdAt = new Date(event.createdAt);

        const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
        const daysSinceCreated = Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24));

        if ((event.ticketsSold + qty) > event.totalTickets) {
            return res.status(400).json({ 
                message: `Insufficient tickets! Only ${event.totalTickets - event.ticketsSold} left.` 
            });
        }

        const bookedTickets = [];

        for (let i = 0; i < qty; i++) {
            const ticketId = new mongoose.Types.ObjectId();
            const qrCodeBase64 = await QRCode.toDataURL(ticketId.toString());

            const newTicket = new Ticket({
                _id: ticketId,
                event: eventId,
                user: userId,
                purchasePrice: event.currentPrice,
                qrCode: qrCodeBase64,
                status: 'Valid'
            });

            await newTicket.save();
            bookedTickets.push(newTicket);

            event.ticketsSold += 1;
            const occupancyRate = event.ticketsSold / event.totalTickets;

            // --- 2. RULE-BASED MULTIPLIER ---
            let ruleMultiplier = 1.0;

            // Early Demand Spike
            if (daysSinceCreated <= 5 && occupancyRate > 0.50) {
                ruleMultiplier += 0.15;
            } 
            // Early Low Demand
            else if (daysSinceCreated <= 5 && occupancyRate <= 0.50) {
                ruleMultiplier -= 0.20;
            }

            // Last-minute "Flash Sale"
            if (daysUntilEvent <= 2 && occupancyRate < 0.90) {
                ruleMultiplier -= 0.20;
            }

            // --- 3. HYBRID MULTIPLIER (ML + RULE) ---
            const priceMultiplier = await getHybridMultiplier(
                occupancyRate,
                daysUntilEvent,
                daysSinceCreated,
                ruleMultiplier
            );

            const calculatedPrice = event.basePrice * priceMultiplier;
            event.currentPrice = Math.round(Math.max(calculatedPrice, event.basePrice * 0.5));
        }

        await event.save();

        res.status(201).json({
            success: true,
            message: `${qty} Ticket(s) booked successfully!`,
            simulationDate: now.toDateString(),
            occupancy: (event.ticketsSold / event.totalTickets * 100).toFixed(1) + "%",
            nextTicketPrice: event.currentPrice,
            tickets: bookedTickets
        });

    } catch (err) {
        console.error("Booking Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// ==========================================
// @desc    Get tickets for the logged-in user
// @route   GET /api/tickets/my-tickets
// ==========================================
exports.getUserTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await Ticket.find({ user: userId }).populate('event').sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==========================================
// @desc    Verify a ticket (Admin Scan)
// @route   POST /api/tickets/verify
// ==========================================
exports.verifyTicket = async (req, res) => {
    try {
        const { ticketId } = req.body;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });
        if (ticket.status === 'Used') return res.status(400).json({ message: "Ticket already used" });

        ticket.status = 'Used';
        await ticket.save();

        res.status(200).json({ success: true, message: "Ticket Verified Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};