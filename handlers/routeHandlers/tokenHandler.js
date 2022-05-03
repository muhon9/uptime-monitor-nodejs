const { hash, parseJSON, generateToken } = require('../../helpers/utilities');
const dataLib = require('../../lib/dataLib');

const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const allowedMethods = ['get', 'post', 'put', 'delete'];

    // check if it is a valid method
    if (allowedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    // validate all the user registration data

    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length >= 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length !== 0
            ? requestProperties.body.password
            : false;

    if (phone && password) {
        dataLib.read('users', phone, (err1, userData) => {
            if (!err1 && userData) {
                const hashedPassword = hash(password);
                if (hashedPassword === parseJSON(userData).password) {
                    const tokenId = generateToken(20);
                    const expire = Date.now() + 60 * 60 * 1000;
                    const tokenDataObject = {
                        phone,
                        tokenId,
                        expire,
                    };

                    dataLib.create('tokens', tokenId, tokenDataObject, (err2, data) => {
                        if (!err2) {
                            callback(200, data);
                        } else {
                            callback(500, {
                                error: 'Token creation failed',
                            });
                        }
                    });
                } else {
                    callback(500, {
                        error: 'Wrong user or password',
                    });
                }
            } else {
                callback(500, {
                    error: 'There was an error',
                });
            }
        });
    } else {
        callback(500, {
            error: 'There was an error',
        });
    }
};

handler._token.get = (requestProperties, callback) => {
    const tokenId =
        typeof requestProperties.queryStringObject.tokenId === 'string' &&
        requestProperties.queryStringObject.tokenId.trim().length === 20
            ? requestProperties.queryStringObject.tokenId
            : false;

    if (tokenId) {
        dataLib.read('tokens', tokenId, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(500, {
                    error: 'No such token',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Token not found',
        });
    }
};

handler._token.put = (requestProperties, callback) => {
    const tokenId =
        typeof requestProperties.body.tokenId === 'string' &&
        requestProperties.body.tokenId.trim().length === 20
            ? requestProperties.body.tokenId
            : false;

    const extend =
        typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true
            ? requestProperties.body.extend
            : false;

    if (tokenId && extend) {
        dataLib.read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                const tokenDataObject = { ...parseJSON(tokenData) };
                if (tokenDataObject.expire > Date.now()) {
                    tokenDataObject.expire = Date.now() + 60 * 60 * 1000;
                    dataLib.update('tokens', tokenId, tokenDataObject, (err2, updatedData) => {
                        if (!err2 && updatedData) {
                            callback(200, updatedData);
                        } else {
                            callback(500, {
                                error: 'There was a problem',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'Token already expired',
                    });
                }
            } else {
                callback(400, {
                    error: 'No such token found',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Incomplete data provided',
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
    const tokenId =
        typeof requestProperties.queryStringObject.tokenId === 'string' &&
        requestProperties.queryStringObject.tokenId.trim().length === 20
            ? requestProperties.queryStringObject.tokenId
            : false;

    if (tokenId) {
        dataLib.read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                dataLib.remove('tokens', tokenId, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'Token deleted successfully',
                        });
                    } else {
                        callback(400, {
                            error: 'Tplem deleting failed',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'No such token exist',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Incomplete data provided',
        });
    }
};

// this is a function that will verify if a user is authorized
handler._token.verify = (id, tokenId, callback) => {
    dataLib.read('tokens', tokenId, (err1, tokenData) => {
        if (!err1 && tokenData) {
            const tokenDataObject = { ...parseJSON(tokenData) };
            if (tokenDataObject.phone === id && tokenDataObject.expire > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;
