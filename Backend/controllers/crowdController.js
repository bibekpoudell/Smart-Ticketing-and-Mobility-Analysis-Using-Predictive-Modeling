const Crowd = require('../models/crowd');

// Updates the count coming from the ESP32 (via bridge.js)
exports.updateSectionC = async (req, res) => {
    try {
        const { count } = req.body;
        const updated = await Crowd.findOneAndUpdate(
            { sectionName: "Section C" },
            { currentCount: count },
            { upsert: true, new: true } // Creates the doc if it doesn't exist
        );
        console.log(`📊 DB Sync: Section C is now at ${updated.currentCount}`);
        res.status(200).json(updated);
    } catch (err) {
        console.error("❌ Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// Sends the count to your React Dashboard
exports.getCrowdStatus = async (req, res) => {
    try {
        const status = await Crowd.findOne({ sectionName: "Section C" });
        
        // If 'status' is null (meaning no sensor data yet), 
        // we return 0 so the chart displays correctly.
        res.status(200).json({ 
            countC: status ? status.currentCount : 0,
            capacityC: status ? status.capacity : 100 // Good to send capacity too!
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};