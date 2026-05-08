const UserProfile = require('../models/UserProfile');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const profile = await UserProfile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found. Please create your profile first.' });
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create or Update user profile
// @route   POST /api/user/profile
// @access  Private
const saveProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const {
            firstName,
            lastName,
            companyName,
            phone,
            email,
            country,
            state,
            addressLine1,
            addressLine2,
            city,
            pinCode,
            orderNotes
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !addressLine1 || !city || !pinCode) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields: First Name, Last Name, Phone, Email, Address, City, PIN Code'
            });
        }

        // Create or Update (upsert)
        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            {
                userId,
                firstName,
                lastName,
                companyName: companyName || '',
                phone,
                email,
                country: country || 'India',
                state: state || '',
                addressLine1,
                addressLine2: addressLine2 || '',
                city,
                pinCode,
                orderNotes: orderNotes || ''
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile saved successfully',
            data: profile
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user profile
// @route   DELETE /api/user/profile
// @access  Private
const deleteProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        await UserProfile.findOneAndDelete({ userId });
        res.status(200).json({ success: true, message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getProfile, saveProfile, deleteProfile };
