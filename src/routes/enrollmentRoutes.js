const express = require('express');
const router = express.Router();
const {
    createEnrollment,
    getEnrollments,
    getEnrollmentById,
    updateEnrollment,
    deleteEnrollment
} = require('../controllers/enrollmentController');

// Public route for form submission
router.post('/', createEnrollment);

// Routes
router.get('/', getEnrollments);
router.get('/:id', getEnrollmentById);
router.put('/:id', updateEnrollment);
router.delete('/:id', deleteEnrollment);

module.exports = router;
