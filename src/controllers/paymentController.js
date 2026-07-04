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

        // 1. Prevent Duplicate Initiation (Idempotency Check)
        // Check if there's an initiated payment for the same user/course/amount in the last 10 seconds
        const existingPayment = await Payment.findOne({
            'customerDetails.email': customerEmail,
            courseId: courseId,
            amount: Number(amount),
            status: 'Initiated',
            createdAt: { $gte: new Date(Date.now() - 10000) } // 10 second window
        });

        if (existingPayment) {
            console.log(`Duplicate payment initiation detected for ${customerEmail}.`);
            // If the gateway response is already there, return it instead of creating a new one
            if (existingPayment.gatewayResponse && existingPayment.gatewayResponse.redirectURI) {
                return res.status(200).json({
                    success: true,
                    data: existingPayment.gatewayResponse,
                    merchantTxnNo: existingPayment.merchantTxnNo,
                    paymentUrl: `${existingPayment.gatewayResponse.redirectURI}?tranCtx=${existingPayment.gatewayResponse.tranCtx}`,
                    message: 'Restored existing payment session'
                });
            }
            // If it's still being processed by the first request, return an error to prevent a second entry
            return res.status(429).json({
                success: false,
                message: 'A payment request is already in progress. Please wait a few seconds.'
            });
        }

        // 2. Generate Unique Transaction ID
        const merchantTxnNo = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const txnDate = formatTxnDate();

        // 3. Prepare Data for ICICI - Complete Final Payload (Non-Seamless)
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

        // 4. Generate Hash
        const secureHash = generateRequestHash(iciciData, process.env.ICICI_SECRET_KEY);
        iciciData.secureHash = secureHash;

        // 5. Create Payment Record in Database
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

        // 6. Call ICICI Initiate Sale API
        const response = await axios.post(process.env.ICICI_INITIATE_URL, iciciData, {
            headers: { 'Content-Type': 'application/json' }
        });

        // 7. Update payment record with gateway response
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
        let responseData = { ...req.query, ...req.body };
        console.log('Received Callback from ICICI:', JSON.stringify(responseData, null, 2));

        // 0. Handle potential nested/encoded response data
        const nestedData = responseData.responseData || responseData.ResponseData;
        if (nestedData && typeof nestedData === 'string') {
            try {
                if (nestedData.trim().startsWith('{')) {
                    responseData = { ...responseData, ...JSON.parse(nestedData) };
                } else {
                    const params = new URLSearchParams(nestedData);
                    for (const [key, val] of params.entries()) {
                        responseData[key] = val;
                    }
                }
            } catch (e) {
                console.warn('Could not parse nested responseData:', e.message);
            }
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // Helper for case-insensitive field access
        const getVal = (obj, key) => {
            const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
            return foundKey ? obj[foundKey] : undefined;
        };

        const merchantTxnNo = getVal(responseData, 'merchantTxnNo');

        // If no transaction data is present, we can't continue
        if (!merchantTxnNo) {
            console.warn('Empty or invalid callback received (no merchantTxnNo)');
            return res.redirect(`${frontendUrl}/payment-status?status=Cancelled`);
        }

        // 1. Verify Hash (Optional check)
        const isHashValid = verifyResponseHash(responseData, process.env.ICICI_SECRET_KEY);
        if (!isHashValid) {
            console.warn('Invalid Secure Hash in Callback! Proceeding with caution...');
        }

        // 2. Find Payment Record
        const payment = await Payment.findOne({ merchantTxnNo });
        if (!payment) {
            console.error('Payment record not found for txn:', merchantTxnNo);
            return res.redirect(`${frontendUrl}/payment-status?status=Error&message=TransactionNotFound`);
        }

        // 3. Update Status (Robust Check)
        const successSignals = ['0', '00', '000', '0000', 'SUCCESS', 'PROCCED', 'PROCESSED', 'COMPLETED'];

        const responseCode = String(getVal(responseData, 'responseCode') || getVal(responseData, 'respCode') || '');
        const statusVal = String(getVal(responseData, 'status') || getVal(responseData, 'respMsg') || getVal(responseData, 'respDescription') || '').toUpperCase();

        let isSuccess = successSignals.includes(responseCode) ||
            successSignals.includes(statusVal) ||
            statusVal.includes('SUCCESS') ||
            statusVal.includes('PROCCED') ||
            statusVal.includes('PROCESSED');

        // Fallback: Global search in all values
        if (!isSuccess) {
            isSuccess = Object.values(responseData).some(val =>
                typeof val === 'string' && successSignals.includes(val.toUpperCase())
            );
        }

        if (isSuccess) {
            payment.status = 'Success';
            console.log(`Payment SUCCESS confirmed for ${merchantTxnNo}`);
        } else {
            payment.status = 'Failed';
            console.warn(`Payment marked FAILED for ${merchantTxnNo}. Code: ${responseCode}, Status: ${statusVal}`);
        }

        // 4. Map Gateway Fields for Dashboard UI
        const bankRef = getVal(responseData, 'paymentID') ||
            getVal(responseData, 'pgTxnNo') ||
            getVal(responseData, 'bankRefNo') ||
            getVal(responseData, 'txnID') ||
            getVal(responseData, 'rrn');

        const pMode = getVal(responseData, 'paymentMode') ||
            getVal(responseData, 'payMode') ||
            'ONLINE_DIGITAL';

        payment.gatewayResponse = {
            ...payment.gatewayResponse,
            paymentId: bankRef,
            paymentMode: pMode,
            callback: responseData,
            hashVerified: isHashValid
        };
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
