const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    seedCoursesData
} = require('../controllers/courseController');

const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(createCourse);

router.post('/seed', seedCoursesData);

router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

module.exports = router;
