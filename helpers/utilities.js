const crypto = require('crypto');
const environment = require('./environments');

const utilities = {};

utilities.parseJSON = (str) => {
    let obj;
    try {
        obj = JSON.parse(str);
    } catch (err) {
        obj = {};
    }
    return obj;
};

// eslint-disable-next-line prettier/prettier
utilities.hash = (str) => crypto.createHmac('sha256', environment.secreteKey).update(str).digest('hex');

utilities.generateToken = (strlength) => {
    const charOptions = 'abcdefghijklmnopqrstuvwxyz123456789';
    let output = '';

    for (let i = 0; i < strlength; i += 1) {
        const randomChar = charOptions.charAt(Math.random() * charOptions.length);
        output += randomChar;
    }
    return output;
};

module.exports = utilities;
