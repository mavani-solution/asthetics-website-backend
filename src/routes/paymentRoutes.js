const express = require('express');
const router = express.Router();
const { initiatePayment, handleCallback, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Initiate payment (Requires Login)
router.post('/initiate', protect, initiatePayment);

// Payment Callback (Public - ICICI will call this)
router.post('/callback', handleCallback);

// Get Payment Status (Requires Login)
router.get('/:merchantTxnNo', protect, getPaymentStatus);

module.exports = router;
