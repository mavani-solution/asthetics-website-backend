const Hero = require('../models/Hero');

// @desc    Get all hero slides
// @route   GET /api/hero
// @access  Public
const getHeroes = async (req, res) => {
    try {
        const heroes = await Hero.find({ isActive: true }).sort('order');
        res.status(200).json({ success: true, count: heroes.length, data: heroes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all hero slides (including inactive) for admin
// @route   GET /api/hero/admin
// @access  Private (Admin Only)
const getAdminHeroes = async (req, res) => {
    try {
        const heroes = await Hero.find().sort('order');
        res.status(200).json({ success: true, count: heroes.length, data: heroes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new hero slide
// @route   POST /api/hero
// @access  Private (Admin Only)
const createHero = async (req, res) => {
    try {
        const hero = await Hero.create(req.body);
        res.status(201).json({ success: true, data: hero });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update hero slide
// @route   PUT /api/hero/:id
// @access  Private (Admin Only)
const updateHero = async (req, res) => {
    try {
        const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hero) {
            return res.status(404).json({ success: false, message: 'Hero slide not found' });
        }

        res.status(200).json({ success: true, data: hero });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete hero slide
// @route   DELETE /api/hero/:id
// @access  Private (Admin Only)
const deleteHero = async (req, res) => {
    try {
        const hero = await Hero.findByIdAndDelete(req.params.id);

        if (!hero) {
            return res.status(404).json({ success: false, message: 'Hero slide not found' });
        }

        res.status(200).json({ success: true, message: 'Hero slide deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getHeroes,
    getAdminHeroes,
    createHero,
    updateHero,
    deleteHero
};
