const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add your full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add your email address'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add your phone number']
    },
    courseInterest: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: false // Optional if they just have a general inquiry
    },
    message: {
        type: String,
        required: [true, 'Please add your inquiry details'],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Inquiry', InquirySchema);
