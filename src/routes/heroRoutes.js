const express = require('express');
const router = express.Router();
const {
    getHeroes,
    getAdminHeroes,
    createHero,
    updateHero,
    deleteHero
} = require('../controllers/heroController');

const { protect } = require('../middleware/auth');

// Public route for the main website
router.get('/', getHeroes);

// Protected routes (Admin only)
router.get('/admin', protect, getAdminHeroes);
router.post('/', protect, createHero);
router.put('/:id', protect, updateHero);
router.delete('/:id', protect, deleteHero);

module.exports = router;
