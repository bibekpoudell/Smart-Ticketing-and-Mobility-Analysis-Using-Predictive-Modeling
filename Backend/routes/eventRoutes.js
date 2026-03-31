const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Event = require("../models/Event"); // Ensure this path to your model is correct
const { createEvent, getAllEvents } = require("../controllers/eventController");

// Configure how files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create Event
router.post("/create", upload.single('image'), createEvent);

// Get All Events
router.get("/all", getAllEvents);

// --- NEW: Update Event Route ---
router.put("/update/:id", upload.single('image'), async (req, res) => {
    try {
        const eventId = req.params.id;
        let updateData = { ...req.body };

        // If a new file is uploaded, update the posterUrl
        if (req.file) {
            updateData.posterUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json(updatedEvent);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Server error during update", error: err.message });
    }
});

// --- NEW: Delete Event Route (Good to have) ---
router.delete("/:id", async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

module.exports = router;