// src/middleware/errorMiddleware.js

// Basic error handler middleware
const errorHandler = (err, req, res, next) => {
    // Log the error for the developer (important!)
    // In production, you might want more sophisticated logging
    console.error(`Error Name: ${err.name}`);
    console.error(`Error Message: ${err.message}`);
    // console.error(err.stack); // Optionally log stack trace in dev

    // Default error status and message
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Use existing status code if set, otherwise default to 500
    let message = err.message || 'Internal Server Error';

    // --- Handle Specific Mongoose Errors ---

    // Mongoose Bad ObjectId (CastError)
    if (err.name === 'CastError') {
        message = `Resource not found with id of ${err.value}. Invalid format.`;
        statusCode = 404; // Or 400 Bad Request, depending on preference
    }

    // Mongoose Duplicate Key Error (e.g., unique email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]; // Get the field that caused the error
        message = `Duplicate field value entered: '${err.keyValue[field]}'. Please use another value for ${field}.`;
        statusCode = 400;
    }

    // Mongoose Validation Error (e.g., required fields, minlength)
    if (err.name === 'ValidationError') {
        // Combine multiple validation error messages
        message = Object.values(err.errors)
            .map(val => val.message)
            .join('. ');
        statusCode = 400;
    }

    // --- Handle Specific JWT Errors (Optional - if you modify authMiddleware later) ---
    // if (err.name === 'JsonWebTokenError') {
    //     message = 'Not authorized, token failed (invalid signature)';
    //     statusCode = 401;
    // }
    // if (err.name === 'TokenExpiredError') {
    //     message = 'Not authorized, token expired';
    //     statusCode = 401;
    // }


    // Send the standardized error response
    res.status(statusCode).json({
        success: false,
        message: message,
        // Optionally include stack trace only in development environment
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    // We don't call next() here because we are sending the response
};

module.exports = errorHandler;