// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Handle user registration
exports.signupUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Basic input check
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password',
            });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email address already registered.',
            });
        }

        // Create the new user (password hashed automatically by model hook)
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password,
        });

        // Send success response (user data without password)
        res.status(201).json({
            success: true,
            data: { // Explicitly define returned data
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
        console.error('Signup Error:', error); // Log error for debugging

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ') || 'Invalid input data.',
            });
        }
        // Handle duplicate email error (just in case the check above fails)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email address already registered.',
            });
        }

        // General server error
        res.status(500).json({
            success: false,
            message: 'Server error during signup.',
        });
    }
};

// Handle user login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password provided
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        // Find user by email (include password for comparison)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // Generic message for security
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // User is valid, prepare JWT payload
        const payload = {
            id: user._id,
            role: user.role
        };

        // Sign the JWT
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // Make sure JWT_SECRET is in your .env!
            { expiresIn: process.env.JWT_EXPIRE } // Make sure JWT_EXPIRE is in your .env! (e.g., '30d')
        );

        // Send token to client
        res.status(200).json({
            success: true,
            token: token,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login Error:', error); // Log error for debugging
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};