// src/routes/logRoutes.js
const express = require('express'); // Need Express to create routes
const router = express.Router(); // Get the router instance from Express

// Import the functions that actually handle creating/getting logs
const { createLog, getLogs } = require('../controllers/logController');

// Import our custom middleware for checking login status and roles
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Apply Authentication Middleware ---
// IMPORTANT: This line applies the 'protect' middleware to ALL routes defined below in this file.
// This means a user MUST be logged in (provide a valid JWT) to use any '/api/logs' endpoint.
router.use(protect);

// --- Define Routes ---

// Handle POST requests to /api/logs
// Purpose: Let logged-in users add a new activity log.
router.post('/', createLog);

// Handle GET requests to /api/logs
// Purpose: Let users with the 'admin' role fetch all activity logs.
// Note: 'authorize('admin')' runs *after* 'protect' ensures the user is logged in.
router.get('/', authorize('admin'), getLogs);

// (Future routes for updating, deleting, or getting user-specific logs would go here)
// // Example: GET /api/logs/my-logs --> Get logs for the currently logged-in user
// router.get('/my-logs', getMyLogs); // This would also be protected by router.use(protect)

// Make these routes available to our main app.js file
module.exports = router;