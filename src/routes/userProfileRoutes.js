const express = require('express');
const router = express.Router();
const { getProfile, saveProfile, deleteProfile } = require('../controllers/userProfileController');
const { protect } = require('../middleware/auth');

// Get profile
router.get('/profile', protect, getProfile);

// Create or Update profile
router.post('/profile', protect, saveProfile);

// Delete profile
router.delete('/profile', protect, deleteProfile);

module.exports = router;
