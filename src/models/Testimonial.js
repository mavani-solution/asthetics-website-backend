const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true
    },
    content: {
        type: String,
        required: false
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

TestimonialSchema.pre('validate', function () {
    if (this.type === 'image') {
        if (!this.name) {
            this.invalidate('name', 'Name is required for image testimonials.', this.name);
        }
        if (!this.image) {
            this.invalidate('image', 'Image is required for image testimonials.', this.image);
        }
        if (!this.content) {
            this.invalidate('content', 'Content is required for image testimonials.', this.content);
        }
    }
    if (this.type === 'video' && !this.videoUrl) {
        this.invalidate('videoUrl', 'Video URL is required for video testimonials.', this.videoUrl);
    }
    if (this.image && this.videoUrl) {
        this.invalidate('type', 'A testimonial can only have either an image OR a video URL, not both.', this.type);
    }
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
