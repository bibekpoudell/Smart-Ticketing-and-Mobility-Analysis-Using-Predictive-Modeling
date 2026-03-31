const mongoose = require('mongoose');

const CrowdSchema = new mongoose.Schema({
    sectionName: { type: String, default: "Section C" },
    currentCount: { type: Number, default: 0 },
    capacity: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Crowd', CrowdSchema);