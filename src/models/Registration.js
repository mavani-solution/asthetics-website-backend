const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
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
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: false
    },
    message: {
        type: String,
        required: false,
        maxlength: [500, 'Message cannot be more than 500 characters']
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

module.exports = mongoose.model('Registration', RegistrationSchema);
