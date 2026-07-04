const Alumni = require('../models/Alumni');

// @desc    Get all alumni entries
// @route   GET /api/alumni
// @access  Public
const getAlumnis = async (req, res) => {
    try {
        const alumniList = await Alumni.find().sort('-createdAt');
        res.status(200).json({ success: true, count: alumniList.length, data: alumniList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single alumni entry
// @route   GET /api/alumni/:id
// @access  Public
const getAlumni = async (req, res) => {
    try {
        const alumni = await Alumni.findById(req.params.id);
        if (!alumni) {
            return res.status(404).json({ success: false, message: 'Alumni entry not found' });
        }
        res.status(200).json({ success: true, data: alumni });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new alumni entry
// @route   POST /api/alumni
// @access  Private (Admin Only)
const createAlumni = async (req, res) => {
    try {
        const alumni = await Alumni.create(req.body);
        res.status(201).json({ success: true, data: alumni });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update alumni entry
// @route   PUT /api/alumni/:id
// @access  Private (Admin Only)
const updateAlumni = async (req, res) => {
    try {
        const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!alumni) {
            return res.status(404).json({ success: false, message: 'Alumni entry not found' });
        }

        res.status(200).json({ success: true, data: alumni });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete alumni entry
// @route   DELETE /api/alumni/:id
// @access  Private (Admin Only)
const deleteAlumni = async (req, res) => {
    try {
        const alumni = await Alumni.findByIdAndDelete(req.params.id);

        if (!alumni) {
            return res.status(404).json({ success: false, message: 'Alumni entry not found' });
        }

        res.status(200).json({ success: true, message: 'Alumni entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAlumnis,
    getAlumni,
    createAlumni,
    updateAlumni,
    deleteAlumni
};
