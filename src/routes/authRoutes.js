// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signupUser, loginUser } = require('../controllers/authController'); // <<< Added loginUser

// POST /api/auth/signup
router.post('/signup', signupUser);

// POST /api/auth/login           // <<< NEW ROUTE
router.post('/login', loginUser);

module.exports = router;