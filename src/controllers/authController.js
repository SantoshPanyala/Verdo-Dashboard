// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Handle user registration
exports.signupUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If errors exist, send back 400 with the error messages
        const errorMessages = errors.array().map(err => err.msg); // Extract messages
        return res.status(400).json({
            success: false,
            message: errorMessages.join('. ') // Join messages into a single string
            // Alternatively send the full errors array: errors: errors.array()
        });
    }


    const { name, email, password } = req.body; // Extract data *after* validation passed

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() }); // Use the validated & normalized email
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email address already registered.',
            });
        }

        // Create the new user
        const newUser = await User.create({
            name, // Use validated & trimmed name if 'trim()' was used
            email: email.toLowerCase(), // Use validated & normalized email
            password, // Use validated password
        });

        // Send success response
        res.status(201).json({
            success: true,
            data: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            },
            message: 'User registered successfully',
        });

    } catch (error) {
        console.error('Signup Error:', error); // Keep console log for server debugging
        next(error); // Pass the error to the centralized handler
    }
};

// Handle user login
exports.loginUser = async (req, res, next) => {
    // --- Check for validation errors from middleware --- // <<< NEW
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            message: errorMessages.join('. ')
        });
    }
    // --- End validation check ---

    const { email, password } = req.body; // Extract after validation

    // --- This old manual check is NO LONGER NEEDED ---
    // if (!email || !password) { ... }

    try {
        // Find user by email (include password for comparison)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password'); // Use validated email

        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // User is valid, prepare JWT payload
        const payload = { id: user._id, role: user.role };

        // Sign the JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        // Send token to client
        res.status(200).json({ success: true, token: token, message: 'Login successful' });

    } catch (error) {
        console.error('Signup Error:', error); // Keep console log for server debugging
        next(error); // Pass the error to the centralized handler
    }
};