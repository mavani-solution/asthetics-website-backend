const mongoose = require('mongoose');

const facconInquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email address'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        maxlength: [15, 'Phone number cannot be longer than 15 characters']
    },
    title: {
        type: String,
        required: [true, 'Please add a professional title'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Doctor', 'Medical Student', 'Industry Professional']
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'resolved'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const FacconInquiry = mongoose.model('FacconInquiry', facconInquirySchema);

module.exports = FacconInquiry;
