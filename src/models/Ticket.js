const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: {
        type: String, // Clerk User ID
        required: true
    },
    // Event Details
    eventName: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true
    },
    eventDate: {
        type: String,
        trim: true,
        default: ''
    },
    eventVenue: {
        type: String,
        trim: true,
        default: ''
    },
    eventImage: {
        type: String,
        trim: true,
        default: '' // Cloudinary URL of event banner/image
    },
    // Ticket Details
    ticketType: {
        type: String,
        enum: ['standard', 'vip', 'early_bird'],
        default: 'standard'
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Minimum quantity is 1'],
        default: 1
    },
    pricePerTicket: {
        type: Number,
        required: [true, 'Price is required']
    },
    totalAmount: {
        type: Number,
        required: true
    },
    // Buyer Details (from User Profile or direct input)
    buyerName: {
        type: String,
        required: [true, 'Buyer name is required'],
        trim: true
    },
    buyerEmail: {
        type: String,
        required: [true, 'Buyer email is required'],
        trim: true,
        lowercase: true
    },
    buyerPhone: {
        type: String,
        required: [true, 'Buyer phone is required'],
        trim: true
    },
    // Payment
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    merchantTxnNo: {
        type: String,
        default: '' // Links to the Payment model
    },
    // Unique Ticket ID for QR code / verification
    ticketCode: {
        type: String,
        unique: true
    },
    // Status
    status: {
        type: String,
        enum: ['active', 'cancelled', 'used'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Auto-generate unique ticket code before saving
ticketSchema.pre('save', function (next) {
    if (!this.ticketCode) {
        this.ticketCode = `FACCON-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    // Auto-calculate total amount
    if (this.quantity && this.pricePerTicket) {
        this.totalAmount = this.quantity * this.pricePerTicket;
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
