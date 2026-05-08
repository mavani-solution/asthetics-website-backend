const crypto = require('crypto');

/**
 * Formats date to YYYYMMDDHHMISS
 * @returns {string}
 */
const formatTxnDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Generates HMAC-SHA256 secure hash for ICICI V0.4 initiateSale request.
 * 
 * Algorithm: HMAC-SHA256
 * Steps:
 *   1. Take all request params (excluding secureHash)
 *   2. Sort keys alphabetically
 *   3. Concatenate values directly WITHOUT any separators
 *   4. Compute HMAC-SHA256 with Secret Key
 * 
 * @param {Object} data - The request data object (without secureHash)
 * @param {string} secretKey - ICICI Secret Key from .env
 * @returns {string} - hex encoded HMAC-SHA256 hash
 */
const generateRequestHash = (data, secretKey) => {
    // 1. Sort all keys alphabetically
    const sortedKeys = Object.keys(data).sort();

    // 2. Build the string from sorted values joined without separators
    const hashString = sortedKeys.map(key => data[key]).join('');

    console.log('=== ICICI Hash Debug ===');
    console.log('Sorted Keys:', sortedKeys);
    console.log('Hash String:', hashString);

    // 3. Generate HMAC-SHA256
    const hash = crypto
        .createHmac('sha256', secretKey)
        .update(hashString)
        .digest('hex');

    console.log('Generated Hash:', hash);
    console.log('========================');

    return hash;
};

/**
 * Verifies HMAC-SHA256 hash from ICICI callback.
 * Same algorithm as request hash — sort keys alphabetically, join values without separators.
 * 
 * @param {Object} responseBody - ICICI callback body
 * @param {string} secretKey - ICICI Secret Key from .env
 * @returns {boolean}
 */
const verifyResponseHash = (responseBody, secretKey) => {
    const receivedHash = responseBody.secureHash;
    if (!receivedHash) {
        console.warn('No secureHash in callback response');
        return false;
    }

    // Exclude secureHash from the hash calculation
    const dataToHash = { ...responseBody };
    delete dataToHash.secureHash;

    // Sort keys alphabetically and join values without separators
    const sortedKeys = Object.keys(dataToHash).sort();
    const hashString = sortedKeys.map(key => dataToHash[key]).join('');

    console.log('=== Callback Hash Verification ===');
    console.log('Hash String:', hashString);

    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(hashString)
        .digest('hex');

    console.log('Received Hash:', receivedHash);
    console.log('Calculated Hash:', calculatedHash);
    console.log('Match:', calculatedHash === receivedHash);
    console.log('==================================');

    return calculatedHash === receivedHash;
};

module.exports = {
    formatTxnDate,
    generateRequestHash,
    verifyResponseHash
};
