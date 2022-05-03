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

module.exports = utilities;
