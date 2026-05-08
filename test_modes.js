const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const url = process.env.ICICI_INITIATE_URL || 'https://pgpay.icicibank.com/pg/api/v2/initiateSale';
const secretKey = process.env.ICICI_SECRET_KEY || '2549c4d9-3bf2-42ed-89bc-23dc15295c07';
const merchantId = process.env.ICICI_MERCHANT_ID || '100000000425883';
const aggregatorID = process.env.ICICI_AGGREGATOR_ID || '100000000425882';

const generateHash = (data) => {
    const sortedKeys = Object.keys(data).sort();
    const hashString = sortedKeys.map(key => data[key]).join('');
    return crypto.createHmac('sha256', secretKey).update(hashString).digest('hex');
};

const testCombination = async (name, customData) => {
    const data = {
        merchantId,
        aggregatorID,
        merchantTxnNo: `TXN${Date.now()}`,
        amount: '5000.00',
        currencyCode: '356',
        transactionType: 'SALE',
        txnDate: '20260508150000',
        returnURL: 'https://spectacular-elegance-production-79af.up.railway.app/api/payment/callback',
        ...customData
    };
    
    data.secureHash = generateHash(data);

    try {
        const res = await axios.post(url, data);
        console.log(`[${name}] Response:`, res.data);
    } catch (err) {
        console.log(`[${name}] Error:`, err.response?.data || err.message);
    }
};

const run = async () => {
    // Test 1: Non-Seamless (No payType, no paymentMode)
    await testCombination('Non-Seamless 1', { 
        customerEmailID: 'test@example.com',
        customerMobileNo: '9876543210'
    });

    // Test 2: Non-Seamless (payType: 0)
    await testCombination('Non-Seamless 2', { 
        payType: '0',
        customerEmailID: 'test@example.com',
        customerMobileNo: '9876543210'
    });

    // Test 3: Seamless CARD without card details
    await testCombination('Seamless CARD', { 
        payType: '1',
        paymentMode: 'CARD',
        customerEmailID: 'test@example.com',
        customerMobileNo: '9876543210'
    });

    // Test 4: Basic (Only minimal fields)
    await testCombination('Minimal', {});
};

run();
