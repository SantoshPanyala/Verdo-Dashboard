// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Need User model to find user from token payload

// Middleware to protect routes
exports.protect = async (req, res, next) => {
    let token;

    // Check if token exists in headers (Authorization: Bearer TOKEN)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (split 'Bearer TOKEN' and take the token part)
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user associated with the token's ID
            // Exclude password from the user object attached to req
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // If user associated with token doesn't exist anymore
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            // User is valid, proceed to the next middleware/controller
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    // If no token was found in the header
    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
};

// Middleware to authorize based on roles (e.g., 'admin')
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // protect middleware should have already run and attached req.user
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ // 403 Forbidden for role issues
                success: false,
                message: `User role '${req.user?.role || 'none'}' is not authorized to access this route`
            });
        }
        // User has the required role, proceed
        next();
    };
};