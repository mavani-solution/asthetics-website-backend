const express = require('express');
const router = express.Router();
const {
    createInquiry,
    getInquiries,
    deleteInquiry
} = require('../controllers/inquiryController');

const { protect } = require('../middleware/auth');

// Public route for form submission
router.post('/', createInquiry);

// Protected routes (Admin only)
router.get('/', protect, getInquiries);
router.delete('/:id', protect, deleteInquiry);

module.exports = router;
