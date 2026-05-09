const Enrollment = require('../models/Enrollment');

// @desc    Submit a new enrollment
// @route   POST /api/enrollments
// @access  Public
const createEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.create(req.body);
        res.status(201).json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private (Admin Only)
const getEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find().sort('-createdAt');
        res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private (Admin Only)
const getEnrollmentById = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        res.status(200).json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update enrollment status
// @route   PUT /api/enrollments/:id
// @access  Private (Admin Only)
const updateEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        res.status(200).json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete an enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private (Admin Only)
const deleteEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        res.status(200).json({ success: true, message: 'Enrollment deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createEnrollment,
    getEnrollments,
    getEnrollmentById,
    updateEnrollment,
    deleteEnrollment
};
