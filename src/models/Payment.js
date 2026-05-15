const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing Clerk User ID or 'guest'
        required: false
    },
    merchantTxnNo: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['Initiated', 'Success', 'Failed', 'Cancelled', 'Pending_Cash'],
        default: 'Initiated'
    },
    paymentMethod: {
        type: String,
        enum: ['Online', 'COD'],
        default: 'Online'
    },
    customerDetails: {
        name: String,
        email: String,
        phone: String,
        companyName: String,
        country: String,
        state: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        pinCode: String,
        orderNotes: String
    },
    payType: {
        type: String, // '0' for Redirection, '1' for Seamless
        default: '1'
    },
    gatewayResponse: {
        type: Object,
        default: {}
    },
    verificationNote: {
        type: String,
        required: false
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    txnDate: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
