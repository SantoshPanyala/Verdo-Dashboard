// src/routes/logRoutes.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// Controller functions
const { createLog, getLogs, getMyLogs, deleteLog,updateLog } = require('../controllers/logController');

// Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Validation Rules for Creating Log --- //
const createLogValidationRules = [
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 0 }).withMessage('Amount must be a non-negative number') // Ensure it's numeric and >= 0
];

// --- Validation Rules for Updating Log --- //
const updateLogValidationRules = [
    param('id') // Check the ID in the URL parameter
        .isMongoId().withMessage('Invalid Log ID format'),
    body('category') // Validate category ONLY IF it's provided
        .optional() // Makes this validation conditional
        .trim()
        .notEmpty().withMessage('Category cannot be empty if provided'),
    body('amount') // Validate amount ONLY IF it's provided
        .optional()
        .isFloat({ min: 0 }).withMessage('Amount must be a non-negative number if provided')
];

// --- Validation Rules for Deleting Log --- //
const deleteLogValidationRules = [
    param('id').isMongoId().withMessage('Invalid Log ID format')
];

// --- Protect all log routes: User must be logged in ---
router.use(protect);

// --- Log Routes ---

// POST /api/logs --> Create a log
router.post('/', createLogValidationRules, createLog);

// GET /api/logs/my-logs --> Get current user's logs
router.get('/my-logs', getMyLogs);

// GET /api/logs --> Get ALL logs (Admin only)
router.get('/', authorize('admin'), getLogs);

router.put('/:id', updateLogValidationRules, updateLog);

router.delete('/:id', deleteLogValidationRules, deleteLog);

module.exports = router;