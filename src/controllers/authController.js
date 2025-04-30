// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');       // <<< ADDED
const jwt = require('jsonwebtoken');    // <<< ADDED

// @desc    Register/Signup a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signupUser = async (req, res) => {
    // ... (existing signup code - no changes needed here)
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
        }
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }
        const newUser = await User.create({ name, email: email.toLowerCase(), password });
        res.status(201).json({ success: true, data: newUser, message: 'User registered successfully' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during signup' });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => { // <<< NEW FUNCTION
    const { email, password } = req.body;

    // 1. Validate email & password presence
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        // 2. Check for user by email & explicitly select password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        // 3. Check if user exists AND password matches
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // Use a generic message for security (don't reveal if email exists but password is wrong)
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 4. User is valid, create JWT
        const payload = {
            id: user._id, // Include user ID in the token payload
            role: user.role // Include role for potential authorization checks later
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // 5. Send token back to client
        res.status(200).json({
            success: true,
            token: token, // Send the generated token
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login Error:', error); // <<< Logs the ACTUAL error to your terminal
        res.status(500).json({ success: false, message: 'Server Error during login' }); // <<< Sends this generic message back to Postman
    }
};