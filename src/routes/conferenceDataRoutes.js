const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getConferenceData,
    updateConferenceData,
    seedConferenceData,
    createConferenceData
} = require('../controllers/conferenceDataController');

router.get('/', getConferenceData);
router.post('/', protect, createConferenceData);
router.put('/', protect, updateConferenceData);
router.post('/seed', protect, seedConferenceData);

module.exports = router;
