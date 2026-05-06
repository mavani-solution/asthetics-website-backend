const FacconInquiry = require('../models/FacconInquiry');

// @desc    Create new Faccon inquiry
// @route   POST /api/faccon-inquiries
// @access  Public
const createInquiry = async (req, res) => {
    try {
        const inquiry = await FacconInquiry.create(req.body);
        res.status(201).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get all Faccon inquiries
// @route   GET /api/faccon-inquiries
// @access  Private (Admin)
const getInquiries = async (req, res) => {
    try {
        const inquiries = await FacconInquiry.find().sort('-createdAt');
        res.status(200).json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single Faccon inquiry
// @route   GET /api/faccon-inquiries/:id
// @access  Private (Admin)
const getInquiry = async (req, res) => {
    try {
        const inquiry = await FacconInquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }
        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update Faccon inquiry status
// @route   PUT /api/faccon-inquiries/:id
// @access  Private (Admin)
const updateInquiryStatus = async (req, res) => {
    try {
        const inquiry = await FacconInquiry.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete Faccon inquiry
// @route   DELETE /api/faccon-inquiries/:id
// @access  Private (Admin)
const deleteInquiry = async (req, res) => {
    try {
        const inquiry = await FacconInquiry.findByIdAndDelete(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = {
    createInquiry,
    getInquiries,
    getInquiry,
    updateInquiryStatus,
    deleteInquiry
};
