const mongoose = require('mongoose');

const CurriculumTopicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a topic title'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Please add an image path or URL for the topic']
    }
});

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true
    },
    duration: {
        type: String,
        required: [true, 'Please add course duration'],
        trim: true
    },
    mode: {
        type: String,
        required: [true, 'Please add course mode (e.g., Online)'],
        trim: true
    },
    fee: {
        type: String,
        required: [true, 'Please add course fee'],
        trim: true
    },
    eligibleShort: {
        type: String,
        required: [true, 'Please add short eligibility description'],
        trim: true
    },
    whoCanApply: {
        type: String,
        required: [true, 'Please add candidate types who can apply (e.g., MBBS Doctors, BDS Doctors)'],
        trim: true
    },
    cardImage: {
        type: String,
        required: [true, 'Please add a card image path or URL'],
        trim: true
    },
    curriculumTopics: [CurriculumTopicSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);
