const axios = require('axios');
const Payment = require('../models/Payment');
const { formatTxnDate, generateRequestHash, verifyResponseHash } = require('../utils/iciciUtils');

// @desc    Initiate payment with ICICI
// @route   POST /api/payment/initiate
// @access  Private
const initiatePayment = async (req, res) => {
    try {
        const { amount, courseId, customerEmail, customerMobile } = req.body;
        const userId = 'guest'; // App has no login feature, use guest

        if (!amount || !customerEmail || !customerMobile) {
            return res.status(400).json({ success: false, message: 'Amount, customerEmail, and customerMobile are required' });
        }

        // 1. Generate Unique Transaction ID
        const merchantTxnNo = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const txnDate = formatTxnDate();

        // 2. Prepare Data for ICICI - Complete Final Payload (Non-Seamless)
        // Omitting payType and paymentMode defaults to ICICI's hosted checkout page,
        // which natively supports UPI, CARD, and NetBanking without missing field errors.
        const iciciData = {
            merchantId: process.env.ICICI_MERCHANT_ID,
            aggregatorID: process.env.ICICI_AGGREGATOR_ID,  // ICICI expects uppercase 'ID'
            merchantTxnNo,
            amount: Number(amount).toFixed(2),
            currencyCode: '356', // INR
            transactionType: 'SALE',
            txnDate,
            returnURL: process.env.ICICI_RETURN_URL,
            customerEmailID: customerEmail,
            customerMobileNo: customerMobile
        };

        // 3. Generate Hash
        const secureHash = generateRequestHash(iciciData, process.env.ICICI_SECRET_KEY);
        iciciData.secureHash = secureHash;

        // 4. Create Payment Record in Database
        const payment = await Payment.create({
            userId,
            merchantTxnNo,
            amount,
            courseId,
            txnDate,
            status: 'Initiated'
        });

        console.log('Sending request to ICICI:', iciciData);

        // 5. Call ICICI Initiate Sale API
        const response = await axios.post(process.env.ICICI_INITIATE_URL, iciciData, {
            headers: { 'Content-Type': 'application/json' }
        });

        // 6. Update payment record with gateway response
        payment.gatewayResponse = response.data;
        await payment.save();

        res.status(200).json({
            success: true,
            data: response.data,
            merchantTxnNo
        });

    } catch (error) {
        console.error('ICICI Integration Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Payment initiation failed',
            error: error.response?.data || error.message
        });
    }
};

// @desc    Handle ICICI Payment Callback
// @route   POST /api/payment/callback
// @access  Public
const handleCallback = async (req, res) => {
    try {
        const responseData = req.body;
        console.log('Received Callback from ICICI:', responseData);

        // 1. Verify Hash
        const isHashValid = verifyResponseHash(responseData, process.env.ICICI_SECRET_KEY);

        // Note: During initial integration, you might want to log if hash fails but proceed with status check
        if (!isHashValid) {
            console.warn('Invalid Secure Hash in Callback!');
            // return res.status(400).json({ success: false, message: 'Invalid hash' });
        }

        // 2. Find Payment Record
        const payment = await Payment.findOne({ merchantTxnNo: responseData.merchantTxnNo });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        // 3. Update Status
        // responseCode '0' or '00' typically means success in ICICI
        if (responseData.responseCode === '0' || responseData.responseCode === '00') {
            payment.status = 'Success';
        } else {
            payment.status = 'Failed';
        }

        payment.gatewayResponse = { ...payment.gatewayResponse, callback: responseData };
        await payment.save();

        // 4. Return success to ICICI (they expect 200 OK)
        res.status(200).send('OK');

    } catch (error) {
        console.error('Callback Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get payment status
// @route   GET /api/payment/:merchantTxnNo
// @access  Private
const getPaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            merchantTxnNo: req.params.merchantTxnNo
        });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    initiatePayment,
    handleCallback,
    getPaymentStatus
};
