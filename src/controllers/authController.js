const User = require('../models/User');


exports.signupUser = async (req, res) => {
    // 1. Extract user data from request body
    const { name, email, password } = req.body;

    try {
        // 2. Basic Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password',
            });
        }

        // 3. Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // 4. Create new user in the database
        // Password hashing happens due to the pre-save hook in User.js
        const newUser = await User.create({
            name,
            email: email.toLowerCase(), // Store email
            password,
            // 'role' will default to 'business user' as defined in the schema
        });

        // 5. Respond with success (Created)
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
        // 6. Handle potential errors (e.g., database errors)
        console.error('Signup Error:', error); // Log the error for debugging
        res.status(500).json({
            success: false,
            message: 'Server Error during signup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Basic Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // 2. Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        // 3. If user not found or password doesn't match
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ // 401 Unauthorized
                success: false,
                message: 'Invalid email or password',
            });
        }

        // 4. Generate JWT
        const token = user.getSignedJwtToken();

        // 5. Respond with token and user data (excluding password)
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
        res.status(500).json({
            success: false,
            message: 'Server Error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};