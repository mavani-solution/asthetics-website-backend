const express = require('express');
const router = express.Router();
const {
    getAlumnis,
    getAlumni,
    createAlumni,
    updateAlumni,
    deleteAlumni
} = require('../controllers/alumniController');

const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAlumnis);
router.get('/:id', getAlumni);

// Protected routes (Admin only)
router.post('/', protect, createAlumni);
router.put('/:id', protect, updateAlumni);
router.delete('/:id', protect, deleteAlumni);

module.exports = router;
