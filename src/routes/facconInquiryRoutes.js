const express = require('express');
const router = express.Router();
const {
    createInquiry,
    getInquiries,
    getInquiry,
    updateInquiryStatus,
    deleteInquiry
} = require('../controllers/facconInquiryController');

// Standard routes
router.route('/')
    .get(getInquiries)
    .post(createInquiry);

router.route('/:id')
    .get(getInquiry)
    .put(updateInquiryStatus)
    .delete(deleteInquiry);

module.exports = router;
