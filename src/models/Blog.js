const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a blog title'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        trim: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Please add content']
    },
    description: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    publishedDate: {
        type: Date,
        default: Date.now
    },
    author: {
        type: String,
        trim: true
    },
    publishedAt: {
        type: Date
    },
    documentId: {
        type: String
    },
    locale: {
        type: String,
        default: 'en'
    },
    faqs: [
        {
            question: String,
            answer: String
        }
    ],
    keywords: {
        type: String,
        trim: true
    },
    views: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: [true, 'Please add a blog image']
    }
}, {
    timestamps: true
});

// Slugify the title before saving
BlogSchema.pre('save', function() {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

module.exports = mongoose.model('Blog', BlogSchema);
