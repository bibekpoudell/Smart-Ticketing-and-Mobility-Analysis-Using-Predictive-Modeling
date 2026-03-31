const express = require("express");
const router = express.Router();
const { bookTicket, getUserTickets, verifyTicket } = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");

// All routes here start with /api/tickets
router.post("/book", protect, bookTicket);
router.get("/my-tickets", protect, getUserTickets);
router.post("/verify", verifyTicket);

// Optional: Fallback for specific userId if needed
router.get("/user/:userId", protect, getUserTickets);

module.exports = router; // This line fixes the TypeError!