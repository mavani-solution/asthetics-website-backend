const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: String, // Clerk User ID
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    companyName: {
        type: String,
        trim: true,
        default: ''
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    country: {
        type: String,
        default: 'India'
    },
    state: {
        type: String,
        trim: true,
        default: ''
    },
    addressLine1: {
        type: String,
        required: [true, 'House number and street name is required'],
        trim: true
    },
    addressLine2: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    pinCode: {
        type: String,
        required: [true, 'PIN Code is required'],
        trim: true
    },
    orderNotes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
