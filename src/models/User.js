const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcryptjs

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true, // Keep unique constraint
        lowercase: true, // Keep lowercase storage
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6, // Enforce a minimum password length
        select: false, // Do not send password back in queries by default
    },
    role: {
        type: String,
        enum: ['business user', 'admin'], // Define possible roles
        default: 'business user', // Set a default role
    },
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Middleware: Hash password before saving user document
// This function runs *before* a 'save' operation on a User document
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt); // Async operation
    next();
});


module.exports = mongoose.model('User', userSchema);