const ActivityLog = require('../models/ActivityLog');

// @desc    Create new activity log
exports.createLog = async (req, res) => {
    try {
        const { user, category, amount } = req.body;

        if (!user || !category || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newLog = await ActivityLog.create({ user, category, amount });

        res.status(201).json({
            success: true,
            data: newLog,
            message: 'Log created successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all activity logs
exports.getLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            data: logs,
            message: 'Logs retrieved successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
