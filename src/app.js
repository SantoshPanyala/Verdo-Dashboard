const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('./middleware/errorMiddleware');


const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const logRoutes = require('./routes/logRoutes');
app.use('/api/logs', logRoutes);

const authRoutes = require('./routes/authRoutes')
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Verda API is running' });
});

// --- Error Handler Middleware ---
// IMPORTANT: Must be registered *after* all other routes and middleware
app.use(errorHandler); // <<< Register error handler


module.exports = app;
