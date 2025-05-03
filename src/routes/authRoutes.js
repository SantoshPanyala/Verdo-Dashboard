// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
// --- Import validation functions ---
const { body } = require('express-validator');

// Import controller functions
const { signupUser, loginUser } = require('../controllers/authController');

// --- Validation Rules for Signup ---
const signupValidationRules = [
    // Check name: not empty, trimmed
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required'),

    // Check email: is a valid email format, trimmed, normalized
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(), // Helps canonicalize email addresses

    // Check password: minimum length 6
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// --- Validation Rules for Login ---
const loginValidationRules = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// --- Define Routes ---

// POST /api/auth/signup - Apply validation rules before controller
router.post('/signup', signupValidationRules, signupUser); // <<< Rules added here

// POST /api/auth/login (Validation to be added later)
router.post('/login', loginValidationRules, loginUser);

module.exports = router;