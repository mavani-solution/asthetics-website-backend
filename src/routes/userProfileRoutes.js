const express = require('express');
const router = express.Router();
const { getProfile, saveProfile, deleteProfile } = require('../controllers/userProfileController');

// Get profile (Public)
router.get('/profile', getProfile);

// Create or Update profile (Public)
router.post('/profile', saveProfile);

// Delete profile (Public)
router.delete('/profile', deleteProfile);

module.exports = router;
