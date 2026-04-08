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
// Protected routes (Admin only for mutations, GET is public for reliability)
router.get('/admin', getAdminHeroes);
router.post('/', protect, createHero);
router.put('/:id', protect, updateHero);
router.delete('/:id', protect, deleteHero);

module.exports = router;
