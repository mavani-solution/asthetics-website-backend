const express = require('express');
const router = express.Router();
const { initiatePayment, handleCallback, getPaymentStatus } = require('../controllers/paymentController');

// Initiate payment (Public - Guest Checkout)
router.post('/initiate', initiatePayment);

// Payment Callback (Public - ICICI will call this)
router.post('/callback', handleCallback);

// Get Payment Status (Public)
router.get('/:merchantTxnNo', getPaymentStatus);

module.exports = router;
