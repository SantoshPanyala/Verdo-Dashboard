const express = require('express');
const router = express.Router();
const { createLog, getLogs } = require('../controllers/logController');

// POST /api/logs - Add new activity log
router.post('/', createLog);

// GET /api/logs - Fetch all logs
router.get('/', getLogs);

module.exports = router;
