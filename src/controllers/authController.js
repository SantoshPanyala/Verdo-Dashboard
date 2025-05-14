
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.signupUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Collect all error messages
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            // Join messages or send the array, depending on preference
            message: errorMessages.join('. ')
        });
    }

    const { name, email, password } = req.body;

    try {

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ // Consider if this should be a 409 Conflict
                success: false,
                message: 'User already exists with this email',
            });
        }

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password,
        });

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
        console.error('Signup Error:', error);
        // Pass the error to the centralized error handler
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            message: errorMessages.join('. ')
        });
    }
    // --- END OF ADDED BLOCK ---

    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            message: 'User logged in successfully',
        });

    } catch (error) {
        console.error('Login Error:', error);
        // Pass the error to the centralized error handler
        next(error); //
    }
};