const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    category: {
        type: String, // e.g., "transportation", "electricity", "food"
        required: true,
    },
    amount: {
        type: Number, // e.g., 12.5 (kg CO₂ saved)
        required: true,
    },
    unit: {
        type: String, // e.g., "kg"
        default: 'kg',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
