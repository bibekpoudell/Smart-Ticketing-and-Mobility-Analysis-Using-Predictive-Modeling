const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    // 1. Destructure using 'eventName' to match your Frontend and Model
    const { 
      eventName, 
      description, 
      artist, 
      genre, 
      date, 
      venue, 
      totalTickets, 
      basePrice, 
      currentPrice 
    } = req.body;

    // 2. Validation
    if (!eventName) {
      return res.status(400).json({ error: "Event Name is required." });
    }

    if (!basePrice || !totalTickets) {
      return res.status(400).json({ error: "basePrice and totalTickets are mandatory." });
    }

    // 3. Determine the poster URL
    const posterPath = req.file 
      ? `http://localhost:5000/uploads/${req.file.filename}` 
      : 'https://via.placeholder.com/400x600?text=Event+Poster';

    // 4. Create new instance using 'eventName'
    const newEvent = new Event({
      eventName, // Updated key
      description,
      artist,
      genre: genre || 'Other',
      date,
      venue,
      totalTickets: Number(totalTickets),
      basePrice: Number(basePrice),
      currentPrice: Number(currentPrice || basePrice), 
      posterUrl: posterPath,
      ticketsSold: 0
    });

    const savedEvent = await newEvent.save();
    console.log("✅ Event Successfully Saved to DB:", savedEvent.eventName);
    res.status(201).json(savedEvent);

  } catch (err) {
    console.error("❌ Event Creation Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); 
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};