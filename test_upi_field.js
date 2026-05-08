const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const url = 'https://pgpay.icicibank.com/pg/api/v2/initiateSale'; 
const secretKey = process.env.ICICI_SECRET_KEY || '2549c4d9-3bf2-42ed-89bc-23dc15295c07';
const merchantId = process.env.ICICI_MERCHANT_ID || '100000000425883';
const aggregatorID = process.env.ICICI_AGGREGATOR_ID || '100000000425882';

const generateHash = (data) => {
    const sortedKeys = Object.keys(data).sort();
    const hashString = sortedKeys.map(key => data[key]).join('');
    return crypto.createHmac('sha256', secretKey).update(hashString).digest('hex');
};

const testField = async (fieldName) => {
    const data = {
        merchantId,
        aggregatorID,
        merchantTxnNo: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        amount: '5000.00',
        currencyCode: '356',
        payType: '1',
        transactionType: 'SALE',
        txnDate: '20260508150000',
        returnURL: 'https://spectacular-elegance-production-79af.up.railway.app/api/payment/callback',
        customerEmailID: 'test@example.com',
        customerMobileNo: '9876543210',
        paymentMode: 'UPI'
    };
    
    data[fieldName] = 'test@icici';
    data.secureHash = generateHash(data);

    try {
        const res = await axios.post(url, data);
        if (res.data.responseCode !== 'P1006' || res.data.responseDescription !== 'Invalid request: Secure hash does not match') {
             console.log(`\n============================`);
             console.log(`[SUCCESS/DIFFERENT ERROR] Field matched! => ${fieldName}`);
             console.log(`Response:`, res.data);
             console.log(`============================\n`);
             return true;
        } else {
             process.stdout.write('.');
        }
    } catch (err) {
        console.log(`\n[${fieldName}] Error:`, err.response?.data?.responseDescription || err.message);
    }
    return false;
};

const run = async () => {
    const possibleFields = [
        'customerVpa', 'customerVPA', 'payerVa', 'payerVA', 'vpa', 'VPA', 
        'customerUpiId', 'customerUpiID', 'customerUPIId', 'customerUPIID', 
        'coustmerUpiId', 'coustmerUpiID', 'coustmerUPIId', 'coustmerUPIID',
        'customerUpi', 'customerUPI', 'coustmerUpi', 'coustmerUPI',
        'upiId', 'upiID', 'UPIId', 'UPIID', 'virtualAddress', 'payerVpa',
        'payerVPA', 'customer_vpa', 'coustmerVpa', 'payeeVa', 'coustmer_upi_id',
        'payer_vpa', 'payer_va', 'payer_VA', 'UpiId', 'VirtualAddress',
        'payerVaId', 'payer_va_id', 'vpaId', 'VpaId', 'VPAID'
    ];

    console.log(`Testing ${possibleFields.length} field names...`);
    for (let field of possibleFields) {
        const found = await testField(field);
        if (found) break;
    }
    console.log('\nDone.');
};

run();
