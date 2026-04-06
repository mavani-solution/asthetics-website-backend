const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    seedCoursesData
} = require('../controllers/courseController');

const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(protect, createCourse);

router.post('/seed', protect, seedCoursesData);

router.route('/:id')
    .get(getCourse)
    .put(protect, updateCourse)
    .delete(protect, deleteCourse);

module.exports = router;
