// src/controllers/logController.js
const ActivityLog = require('../models/ActivityLog');

// @desc    Create new activity log
// @route   POST /api/logs
// @access  Private (Requires login)
exports.createLog = async (req, res) => {
    try {
        // --- Get user ID from the authenticated user (added by 'protect' middleware) ---
        const userId = req.user.id; // <<< Use req.user.id from the token

        // --- Get category and amount from the request body ---
        const { category, amount } = req.body; // Only these are needed from the body

        // --- Validation: Check if category and amount are provided ---
        if (!category || amount === undefined || amount === null) { // Check amount existence specifically
            return res.status(400).json({
                success: false, // Add success field
                message: 'Missing required fields: category or amount', // Clearer message
            });
        }

        // --- Ensure amount is a valid number ---
        if (typeof amount !== 'number' || isNaN(amount)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data type for amount: must be a number.',
            });
        }


        // --- Create the new log, associating it with the authenticated user ---
        const newLog = await ActivityLog.create({
            user: userId, // <<< Use the ID from the authenticated user
            category,
            amount,
            // 'unit' and 'timestamp' will use defaults from the model
        });

        // --- Send success response ---
        res.status(201).json({
            success: true,
            data: newLog,
            message: 'Log created successfully',
        });
    } catch (error) {
        console.error('Create Log Error:', error); // Log the error for debugging
        res.status(500).json({
            success: false, // Add success field
            message: 'Server Error creating log',
            // error: error.message // Optionally include error details in development
        });
    }
};

// @desc    Get all activity logs (Admin only)
// @route   GET /api/logs
// @access  Private (Admin only)
exports.getLogs = async (req, res) => {
    try {
        // This route is protected by both 'protect' and 'authorize('admin')'
        const logs = await ActivityLog.find().sort({ timestamp: -1 }); // Find all logs

        res.status(200).json({
            success: true,
            count: logs.length, // Add count for clarity
            data: logs,
            message: 'Logs retrieved successfully',
        });
    } catch (error) {
        console.error('Get Logs Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error retrieving logs'
        });
    }
};