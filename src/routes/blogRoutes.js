const express = require('express');
const router = express.Router();
const {
    getBlogs,
    getBlogBySlug,
    incrementViews,
    createBlog,
    updateBlog,
    deleteBlog
} = require('../controllers/blogController');

const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.patch('/:slug/view', incrementViews);

// Protected routes (Admin only)
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;
