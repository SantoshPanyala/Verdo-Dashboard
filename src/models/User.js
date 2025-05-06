const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // Important: Do not send password back in queries by default
    },
    role: {
        type: String,
        enum: ['business user', 'admin'],
        default: 'business user',
    },
}, {
    timestamps: true
});

// Middleware: Hash password before saving user document
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12); // bcryptjs recommends a salt factor of 10 or 12
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and sign a JWT
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role, name: this.name }, // Payload
        process.env.JWT_SECRET,                             // Secret
        { expiresIn: process.env.JWT_EXPIRE }               // Expiration
    );
};

module.exports = mongoose.model('User', userSchema);