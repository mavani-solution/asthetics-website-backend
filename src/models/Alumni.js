const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: [true, 'Please add a video URL'],
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Alumni', AlumniSchema);
