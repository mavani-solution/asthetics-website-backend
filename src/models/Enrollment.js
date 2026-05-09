const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add your full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    qualification: {
        type: String,
        required: [true, 'Please select your qualification']
    },
    city: {
        type: String,
        required: [true, 'Please select your city']
    },
    address: {
        type: String,
        required: [true, 'Please add your full address']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'contacted'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
