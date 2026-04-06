const express = require('express');
const router = express.Router();
const { upload, uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// Allow admin image uploads with protection
router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;
