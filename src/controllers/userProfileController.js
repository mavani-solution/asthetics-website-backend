const UserProfile = require('../models/UserProfile');
const Payment = require('../models/Payment');
const axios = require('axios');
const { formatTxnDate, generateRequestHash } = require('../utils/iciciUtils');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const userId = 'guest';
        const profile = await UserProfile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found. Please create your profile first.' });
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create or Update user profile and handle Checkout (COD/Online)
// @route   POST /api/user/profile
// @access  Private
const saveProfile = async (req, res) => {
    try {
        const userId = 'guest';
        const {
            firstName,
            lastName,
            companyName,
            phone,
            email,
            country,
            state,
            addressLine1,
            addressLine2,
            city,
            pinCode,
            orderNotes,
            // Payment Fields
            paymentMethod,
            amount,
            courseId
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !addressLine1 || !city || !pinCode) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields: First Name, Last Name, Phone, Email, Address, City, PIN Code'
            });
        }

        // 1. Create or Update (upsert) User Profile
        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            {
                userId,
                firstName,
                lastName,
                companyName: companyName || '',
                phone,
                email,
                country: country || 'India',
                state: state || '',
                addressLine1,
                addressLine2: addressLine2 || '',
                city,
                pinCode,
                orderNotes: orderNotes || ''
            },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        // 2. Handle Payment logic if method is provided
        if (paymentMethod) {
            if (!amount || !courseId) {
                return res.status(400).json({ success: false, message: 'Amount and Course ID are required for payment.' });
            }

            const customerName = `${firstName} ${lastName}`;
            const txnDate = formatTxnDate(); // Use current formatted date for consistency

            // --- Case A: Cash on Delivery ---
            if (paymentMethod === 'COD') {
                const merchantTxnNo = `COD${Date.now()}${Math.floor(Math.random() * 1000)}`;
                const payment = await Payment.create({
                    userId,
                    merchantTxnNo,
                    amount,
                    courseId,
                    txnDate,
                    status: 'Pending_Cash',
                    paymentMethod: 'COD',
                    customerDetails: {
                        name: customerName,
                        email,
                        phone,
                        companyName: profile.companyName,
                        country: profile.country,
                        state: profile.state,
                        addressLine1: profile.addressLine1,
                        addressLine2: profile.addressLine2,
                        city: profile.city,
                        pinCode: profile.pinCode,
                        orderNotes: profile.orderNotes
                    }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Order placed successfully (COD)',
                    paymentMethod: 'COD',
                    data: { profile, payment }
                });
            }

            // --- Case B: Online (ICICI) ---
            if (paymentMethod === 'Online') {
                const merchantTxnNo = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
                const txnDate = formatTxnDate();

                const iciciData = {
                    merchantId: process.env.ICICI_MERCHANT_ID,
                    aggregatorID: process.env.ICICI_AGGREGATOR_ID,
                    merchantTxnNo,
                    amount: Number(amount).toFixed(2),
                    currencyCode: '356',
                    transactionType: 'SALE',
                    txnDate,
                    returnURL: process.env.ICICI_RETURN_URL,
                    customerEmailID: email,
                    customerMobileNo: phone
                };

                const secureHash = generateRequestHash(iciciData, process.env.ICICI_SECRET_KEY);
                iciciData.secureHash = secureHash;

                // Create Initiated Payment record
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
                        email,
                        phone,
                        companyName: profile.companyName,
                        country: profile.country,
                        state: profile.state,
                        addressLine1: profile.addressLine1,
                        addressLine2: profile.addressLine2,
                        city: profile.city,
                        pinCode: profile.pinCode,
                        orderNotes: profile.orderNotes
                    }
                });

                // Call ICICI Initiate Sale API
                const response = await axios.post(process.env.ICICI_INITIATE_URL, iciciData, {
                    headers: { 'Content-Type': 'application/json' }
                });

                payment.gatewayResponse = response.data;
                await payment.save();

                return res.status(200).json({
                    success: true,
                    message: 'Payment initiated successfully',
                    paymentMethod: 'Online',
                    paymentUrl: `${response.data.redirectURI}?tranCtx=${response.data.tranCtx}`,
                    merchantTxnNo,
                    data: { profile, payment }
                });
            }
        }

        // Default response if no paymentMethod is sent
        res.status(200).json({
            success: true,
            message: 'Profile saved successfully',
            data: profile
        });

    } catch (error) {
        console.error('Checkout Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user profile
// @route   DELETE /api/user/profile
// @access  Private
const deleteProfile = async (req, res) => {
    try {
        const userId = 'guest';
        await UserProfile.findOneAndDelete({ userId });
        res.status(200).json({ success: true, message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getProfile, saveProfile, deleteProfile };
