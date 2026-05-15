const express = require('express');
const router = express.Router();
const { 
    initiatePayment, 
    handleCallback, 
    getPaymentStatus, 
    getAllPayments,
    updatePaymentStatus,
    deletePayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Initiate payment (Public - Guest Checkout)
router.post('/initiate', initiatePayment);

// Payment Callback (Public - ICICI will call this)
// Both GET and POST are allowed to handle redirects and form submissions
router.all('/callback', handleCallback);

// Get all payments (Admin Only)
router.get('/', protect, getAllPayments);

// Update Payment Status (Admin Only)
router.patch('/:id/status', protect, updatePaymentStatus);

// Delete Payment (Admin Only)
router.delete('/:id', protect, deletePayment);

// Get Payment Status (Public)
router.get('/:merchantTxnNo', getPaymentStatus);

module.exports = router;
