const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'aesthetic-india-uploads',
        resource_type: 'auto', // Automatically detect if it's an image or video
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            return file.fieldname + '-' + uniqueSuffix;
        },
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB for video support
});

// @desc    Upload single image to Cloudinary
// @route   POST /api/upload
// @access  Private
const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Cloudinary returns the full secure URL in req.file.path
    res.status(201).json({
        success: true,
        data: req.file.path // This will be the full HTTPS URL
    });
};

module.exports = {
    upload,
    uploadImage
};
