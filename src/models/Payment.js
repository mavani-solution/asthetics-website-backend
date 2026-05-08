const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing Clerk User ID
        required: true
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
        enum: ['Initiated', 'Success', 'Failed', 'Cancelled'],
        default: 'Initiated'
    },
    payType: {
        type: String, // '0' for Redirection, '1' for Seamless
        default: '1'
    },
    gatewayResponse: {
        type: Object,
        default: {}
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    txnDate: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
