const express = require('express');
const router = express.Router();
const {
    getConferenceData,
    updateConferenceData,
    seedConferenceData,
    createConferenceData
} = require('../controllers/conferenceDataController');

router.get('/', getConferenceData);
router.post('/', createConferenceData);
router.put('/', updateConferenceData);
router.post('/seed', seedConferenceData);

module.exports = router;
