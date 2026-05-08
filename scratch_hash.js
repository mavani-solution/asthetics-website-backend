const crypto = require('crypto');

const secretKey = '2549c4d9-3bf2-42ed-89bc-23dc15295c07';
const targetHash = 'c3e11e8dc6f94e0bccad967fc5f56b3b1201a394bdf1b45f0a179d7ed2a0b171';

const data = {
    responseCode: 'P1006',
    responseDescription: 'Invalid request: Secure hash does not match',
    merchantId: '100000000425883',
    aggregatorID: '100000000425882',
    merchantTxnNo: 'TXN1778231986597593'
};

const permutations = [
    // Common response formats
    `${data.responseCode}|${data.merchantId}|${data.merchantTxnNo}|${secretKey}`,
    `${data.responseCode}|${data.merchantTxnNo}|${secretKey}`,
    `${data.responseCode}|${data.responseDescription}|${data.merchantId}|${data.aggregatorID}|${data.merchantTxnNo}|${secretKey}`,
    `${data.merchantId}|${data.aggregatorID}|${data.merchantTxnNo}|${data.responseCode}|${data.responseDescription}|${secretKey}`,
    `${data.responseCode}|${data.merchantTxnNo}|${data.merchantId}|${secretKey}`,
    `${data.responseCode}|${data.merchantId}|${data.aggregatorID}|${data.merchantTxnNo}|${secretKey}`,
    `${data.merchantId}|${data.aggregatorID}|${data.merchantTxnNo}|${data.responseCode}|${secretKey}`,
    `${data.responseCode}|${data.responseDescription}|${data.merchantTxnNo}|${secretKey}`,
    
    // Without secret in string (HMAC style)
    `${data.responseCode}|${data.merchantId}|${data.merchantTxnNo}`,
    `${data.responseCode}|${data.merchantTxnNo}`,
    `${data.responseCode}|${data.responseDescription}|${data.merchantId}|${data.aggregatorID}|${data.merchantTxnNo}`,
    `${data.merchantId}|${data.aggregatorID}|${data.merchantTxnNo}|${data.responseCode}|${data.responseDescription}`,
    `${data.responseCode}|${data.merchantTxnNo}|${data.merchantId}`,
    `${data.responseCode}|${data.merchantId}|${data.aggregatorID}|${data.merchantTxnNo}`,
    `${data.merchantId}|${data.aggregatorID}|${data.merchantTxnNo}|${data.responseCode}`,
];

console.log('Testing SHA-256...');
permutations.forEach(p => {
    const hash = crypto.createHash('sha256').update(p).digest('hex');
    if (hash === targetHash) console.log('FOUND SHA-256:', p);
});

console.log('Testing SHA-256 (no separators)...');
const keys = Object.keys(data);
keys.push('secretKey');
// simple permutations
const noSeps = [
    `${data.responseCode}${data.merchantId}${data.merchantTxnNo}${secretKey}`,
    `${data.responseCode}${data.merchantTxnNo}${secretKey}`,
    `${data.merchantId}${data.merchantTxnNo}${secretKey}`,
];
noSeps.forEach(p => {
    const hash = crypto.createHash('sha256').update(p).digest('hex');
    if (hash === targetHash) console.log('FOUND SHA-256 no sep:', p);
});


// Try sorting alphabetically
const sortedKeys = Object.keys(data).sort();
const sortedValsSep = sortedKeys.map(k => data[k]).join('|') + '|' + secretKey;
const sortedValsNoSep = sortedKeys.map(k => data[k]).join('') + secretKey;
if (crypto.createHash('sha256').update(sortedValsSep).digest('hex') === targetHash) console.log('FOUND SHA-256 sorted sep');
if (crypto.createHash('sha256').update(sortedValsNoSep).digest('hex') === targetHash) console.log('FOUND SHA-256 sorted no sep');

const sortedValsSepHmac = sortedKeys.map(k => data[k]).join('|');
if (crypto.createHmac('sha256', secretKey).update(sortedValsSepHmac).digest('hex') === targetHash) console.log('FOUND HMAC sorted sep');

// Try all fields sorted by keys and joined without secret key
const hmacPerms = [
    sortedValsSepHmac,
    sortedKeys.map(k => data[k]).join('')
];
hmacPerms.forEach(p => {
    if (crypto.createHmac('sha256', secretKey).update(p).digest('hex') === targetHash) {
        console.log('FOUND HMAC-SHA256:', p);
    }
});

