const axios = require('axios');
const Payment = require('../models/Payment');
const { formatTxnDate, generateRequestHash, verifyResponseHash } = require('../utils/iciciUtils');

// @desc    Initiate payment with ICICI
// @route   POST /api/payment/initiate
// @access  Private
const initiatePayment = async (req, res) => {
    try {
        const { amount, courseId, customerName, customerEmail, customerMobile } = req.body;
        const userId = 'guest'; 

        if (!amount || !customerEmail || !customerMobile) {
            return res.status(400).json({ success: false, message: 'Amount, email, and mobile are required' });
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
            status: 'Initiated',
            paymentMethod: 'Online',
            customerDetails: {
                name: customerName,
                email: customerEmail,
                phone: customerMobile
            }
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
            merchantTxnNo,
            paymentUrl: `${response.data.redirectURI}?tranCtx=${response.data.tranCtx}`
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
        // Data can come in body (POST) or query (GET)
        const responseData = { ...req.query, ...req.body };
        console.log('Received Callback from ICICI:', responseData);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // If no transaction data is present, the user likely navigated here directly or clicked 'back' without data
        if (!responseData || !responseData.merchantTxnNo) {
            console.warn('Empty or invalid callback received');
            return res.redirect(`${frontendUrl}/payment-status?status=Cancelled`);
        }

        // 1. Verify Hash
        const isHashValid = verifyResponseHash(responseData, process.env.ICICI_SECRET_KEY);
        
        if (!isHashValid) {
            console.warn('Invalid Secure Hash in Callback!');
        }

        // 2. Find Payment Record
        const payment = await Payment.findOne({ merchantTxnNo: responseData.merchantTxnNo });
        if (!payment) {
            console.error('Payment record not found for txn:', responseData.merchantTxnNo);
            return res.redirect(`${frontendUrl}/payment-status?status=Error&message=TransactionNotFound`);
        }

        // 3. Update Status
        if (responseData.responseCode === '0' || responseData.responseCode === '00') {
            payment.status = 'Success';
        } else {
            // Handle different failure codes (like 'E000' for user cancel)
            payment.status = 'Failed';
            console.log(`Payment failed with code: ${responseData.responseCode}`);
        }

        payment.gatewayResponse = { ...payment.gatewayResponse, callback: responseData };
        await payment.save();

        // 4. Redirect back to frontend
        const redirectUrl = `${frontendUrl}/payment-status?txn=${payment.merchantTxnNo}&status=${payment.status}`;
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Callback Error:', error.message);
        // Avoid sending JSON error to user's browser, redirect instead if possible
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/payment-status?status=Error&message=${encodeURIComponent(error.message)}`);
    }
};

// @desc    Get payment status
// @route   GET /api/payment/:merchantTxnNo
// @access  Public
const getPaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            merchantTxnNo: req.params.merchantTxnNo
        }).populate('courseId', 'title category description');

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payment
// @access  Private/Admin
const getAllPayments = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, search } = req.query;
        
        const query = {};
        
        if (status && status !== 'All') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { merchantTxnNo: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const payments = await Payment.find(query)
            .populate('courseId', 'title category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: payments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Payment Status (Admin Only)
// @route   PATCH /api/payment/:id/status
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
    try {
        const { status, verificationNote } = req.body;
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        payment.status = status;
        if (verificationNote) {
            payment.verificationNote = verificationNote;
        }
        
        await payment.save();

        res.status(200).json({
            success: true,
            message: `Payment status updated to ${status}`,
            data: payment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Payment (Admin Only)
// @route   DELETE /api/payment/:id
// @access  Private/Admin
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        await payment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Payment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    initiatePayment,
    handleCallback,
    getPaymentStatus,
    getAllPayments,
    updatePaymentStatus,
    deletePayment
};
