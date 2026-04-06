const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    designation: {
        type: String,
        required: [true, 'Please add a designation'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please add testimonial content']
    },
    image: {
        type: String,
        required: false
    },
    videoUrl: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    isVerified: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// XOR Validation: Ensure exactly one of image or videoUrl is provided based on type
TestimonialSchema.pre('validate', function () {
    if (this.type === 'image' && !this.image) {
        this.invalidate('image', 'Image is required for image testimonials.', this.image);
    }
    if (this.type === 'video' && !this.videoUrl) {
        this.invalidate('videoUrl', 'Video URL is required for video testimonials.', this.videoUrl);
    }

    // Strict XOR: prevent both
    if (this.image && this.videoUrl) {
        this.invalidate('type', 'A testimonial can only have either an image OR a video URL, not both.', this.type);
    }
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
