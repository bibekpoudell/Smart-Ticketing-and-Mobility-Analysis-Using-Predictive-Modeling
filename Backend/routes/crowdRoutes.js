const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowdController');

// POST: Update Section C (Used by the ESP32 Bridge)
// Full Path: http://localhost:5000/api/crowd/update
router.post('/update', crowdController.updateSectionC);

// GET: Fetch current status (Used by the React Frontend)
// Full Path: http://localhost:5000/api/crowd/status
router.get('/status', crowdController.getCrowdStatus);

module.exports = router;