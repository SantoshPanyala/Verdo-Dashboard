// src/controllers/logController.js
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// Create a new log entry for the logged-in user
exports.createLog = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            message: errorMessages.join('. ')
        });
    }
    try {
        const userId = req.user.id; // ID from authentication token
        const { category, amount } = req.body;

        // Create the log
        const newLog = await ActivityLog.create({
            user: userId,
            category, // Validator trimmed it if trim() was used
            amount: parseFloat(amount) // Use parsed amount
        });
        res.status(201).json({ success: true, data: newLog, message: 'Log created' });

    } catch (error) {
        console.error('Create Log Error:', error);
        next(error);
    }
};

// Get all logs (requires admin role)
exports.getLogs = async (req, res, next) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 }); // Find all, newest first

        res.status(200).json({ success: true, count: logs.length, data: logs, message: 'Logs retrieved successfully' });
    } catch (error) {
        console.error('Get Logs Error:', error);
        next(error);
    }
};

// Get only the logs belonging to the currently logged-in user
exports.getMyLogs = async (req, res, next) => {
    try {
        // Find logs matching current user's ID, newest first
        const logs = await ActivityLog.find({ user: req.user.id }).sort({ timestamp: -1 });

        res.status(200).json({ success: true, count: logs.length, data: logs, message: 'User logs retrieved successfully' });


    } catch (error) {
        console.error('Get My Logs Error:', error);
        next(error);
    }
};

// Delete a specific activity log
exports.deleteLog = async (req, res, next) => {
    // --- Check for validation errors (covers ID format) --- //
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            message: errorMessages.join('. ')
        });
    }

    try {
        const logId = req.params.id; // Get log ID from URL parameters
        const userId = req.user.id; // Get logged-in user's ID from token

        // Check if the logId is a valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(logId)) {
            return res.status(400).json({ success: false, message: 'Invalid Log ID format' });
        }

        // Find the log by its ID
        const log = await ActivityLog.findById(logId);

        // If log doesn't exist
        if (!log) {
            return res.status(404).json({ success: false, message: 'Log not found' });
        }

        // Check Permissions:
        // User must either own the log OR be an admin
        if (log.user.toString() !== userId && req.user.role !== 'admin') {
            // .toString() is needed to compare ObjectId with string ID from token
            return res.status(403).json({ success: false, message: 'User not authorized to delete this log' });
        }

        // Delete the log
        await ActivityLog.findByIdAndDelete(logId);
        // Or alternatively, if you already have the log object: await log.deleteOne();

        // Send success response
        // Status 200 with data:{} or Status 204 No Content are common for successful DELETE
        res.status(200).json({ success: true, data: {}, message: 'Log deleted successfully' });

    } catch (error) {
        console.error('Delete Log Error:', error); // Keep console log
        next(error); // <<< Pass error to the centralized handler
    }
};

exports.updateLog = async (req, res) => {
    // --- Check for validation errors (covers ID format, optional body fields) --- // <<< NEW
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            message: errorMessages.join('. ')
        });
    }
    // --- End validation check ---

    try {
        const logId = req.params.id;
        const userId = req.user.id;
        const { category, amount } = req.body;

        // --- Old manual ID check NO LONGER NEEDED ---
        // if (!mongoose.Types.ObjectId.isValid(logId)) { ... }

        // Find the log first to check ownership
        const log = await ActivityLog.findById(logId);
        if (!log) {
            return res.status(404).json({ success: false, message: 'Log not found' });
        }

        // Check Permissions
        if (log.user.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'User not authorized to update this log' });
        }

        // Prepare update data - validator ensures type/format if fields exist
        const updateData = {};
        if (category !== undefined) updateData.category = category.trim(); // Use trimmed if validator used trim()
        if (amount !== undefined) updateData.amount = parseFloat(amount); // Use parsed amount

        // Check if *any* valid fields were provided for update
        // This check might still be useful if ONLY invalid fields were sent
        // although the .optional() validators handle empty requests better.
        if (Object.keys(updateData).length === 0 && (category === undefined && amount === undefined)) {
            return res.status(400).json({ success: false, message: 'No valid fields provided for update (category or amount required)' });
        }
        // --- Remove old manual type checks ---
        // if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) { ... }
        // if (amount !== undefined && (typeof amount !== 'number' || isNaN(amount))) { ... }

        // Perform the update
        const updatedLog = await ActivityLog.findByIdAndUpdate(logId, updateData, {
            new: true,
            runValidators: true, // Mongoose validation still useful for schema level rules
        });

        if (!updatedLog) { // Should be redundant after findById, but safe check
            return res.status(404).json({ success: false, message: 'Log not found during update' });
        }

        res.status(200).json({ success: true, data: updatedLog, message: 'Log updated successfully' });

    } catch (error) {
        console.error('Update Log Error:', error); // Keep console log
        next(error); // <<< Pass error to the centralized handler
    }
};