const mongoose = require('mongoose');

const HeroSchema = new mongoose.Schema({
    tagline: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Please add a hero title'],
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Please add a hero background image']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hero', HeroSchema);
