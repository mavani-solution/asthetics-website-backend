const express = require('express');
const router = express.Router();
const { getAdminStats, getRegistrations } = require('../controllers/adminController');

const { protect } = require('../middleware/auth');

// Protected dashboard stats endpoint
router.get('/stats', protect, getAdminStats);

// Protected registrations endpoint
router.get('/registrations', protect, getRegistrations);

module.exports = router;
