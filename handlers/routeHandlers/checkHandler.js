const { hash, parseJSON, createRandomString } = require('../../helpers/utilities');
const dataLib = require('../../lib/dataLib');
const tokenHandler = require('./tokenHandler');

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const allowedMethods = ['get', 'post', 'put', 'delete'];

    // check if it is a valid method
    if (allowedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // validate all the user registration data
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const successCode =
        typeof requestProperties.body.successCode === 'object' &&
        requestProperties.body.successCode instanceof Array
            ? requestProperties.body.successCode
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const timeout =
        typeof requestProperties.body.timeOut === 'number' &&
        requestProperties.body.timeOut > 0 &&
        requestProperties.body.timeOut < 11
            ? requestProperties.body.timeOut
            : false;

    if (protocol && url && method && successCode && timeout) {
        const tokenId =
            requestProperties.headerObject.token &&
            typeof requestProperties.headerObject.token === 'string'
                ? requestProperties.headerObject.token
                : false;

        dataLib.read('tokens', tokenId, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                dataLib.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        const userObject = { ...parseJSON(userData) };
                        tokenHandler._token.verify(userPhone, tokenId, (tokenExist) => {
                            if (tokenExist) {
                                // create check object and save
                                const checkId = createRandomString(20);
                                const checkObject = {
                                    id: checkId,
                                    protocol,
                                    url,
                                    successCode,
                                    timeout,
                                    method,
                                    userPhone,
                                };
                                dataLib.create(
                                    'checks',
                                    checkId,
                                    checkObject,
                                    (err3, checkData) => {
                                        if (!err3) {
                                            // save the check to the user
                                            userObject.checks = userObject.checks
                                                ? userObject.checks
                                                : [];
                                            userObject.checks.push(checkId);
                                            dataLib.update(
                                                'users',
                                                userPhone,
                                                userObject,
                                                (err4) => {
                                                    if (!err4) {
                                                        callback(200, 'Success');
                                                    } else {
                                                        callback(500, {
                                                            error: 'There was a problem',
                                                        });
                                                    }
                                                }
                                            );
                                        } else {
                                            callback(500, {
                                                error: 'There was a  problem',
                                            });
                                        }
                                    }
                                );
                            } else {
                                callback(500, {
                                    error: 'Authntication failed',
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: 'There was a  problem',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'Authntication failed',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Incomplete data',
        });
    }
};

handler._check.get = (requestProperties, callback) => {
    const checkId =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (checkId) {
        dataLib.read('checks', checkId, (err1, checkObject) => {
            if (!err1) {
                const { userPhone } = parseJSON(checkObject);

                tokenHandler._token.verify(
                    userPhone,
                    requestProperties.headerObject.token,
                    (tokenValid) => {
                        if (tokenValid) {
                            callback(200, parseJSON(checkObject));
                        } else {
                            callback(403, { error: 'Authentication failed' });
                        }
                    }
                );
            } else {
                callback(400, {
                    error: 'No such checks found',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Data not provided',
        });
    }
};

handler._check.put = (requestProperties, callback) => {
    const checkId =
        typeof requestProperties.body.checkId === 'string' &&
        requestProperties.body.checkId.length === 20
            ? requestProperties.body.checkId
            : false;

    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const successCode =
        typeof requestProperties.body.successCode === 'object' &&
        requestProperties.body.successCode instanceof Array
            ? requestProperties.body.successCode
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const timeout =
        typeof requestProperties.body.timeOut === 'number' &&
        requestProperties.body.timeOut > 0 &&
        requestProperties.body.timeOut < 11
            ? requestProperties.body.timeOut
            : false;

    if (checkId) {
        dataLib.read('checks', checkId, (err1, checkData) => {
            if (!err1) {
                const checkObject = { ...parseJSON(checkData) };
                tokenHandler._token.verify(
                    checkObject.userPhone,
                    requestProperties.headerObject.token,
                    (tokenValid) => {
                        if (tokenValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCode) {
                                checkObject.successCode = successCode;
                            }
                            if (timeout) {
                                checkObject.timeout = timeout;
                            }
                            dataLib.update('checks', checkId, checkObject, (err2, updatedData) => {
                                if (!err2) {
                                    callback(200, updatedData);
                                }
                            });
                        } else {
                            callback(403, { error: 'Authentication failed' });
                        }
                    }
                );
            } else {
                callback(400, {
                    error: 'No such checks found',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Incomplete data provided',
        });
    }
};

handler._check.delete = (requestProperties, callback) => {
    const checkId =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (checkId) {
        dataLib.read('checks', checkId, (err1, checkData) => {
            if (!err1) {
                const checkObject = { ...parseJSON(checkData) };
                tokenHandler._token.verify(
                    checkObject.userPhone,
                    requestProperties.headerObject.token,
                    (tokenValid) => {
                        if (tokenValid) {
                            dataLib.remove('checks', checkId, (err3) => {
                                if (!err3) {
                                    dataLib.read(
                                        'users',
                                        checkObject.userPhone,
                                        (err4, userData) => {
                                            if (!err4) {
                                                const userObject = { ...parseJSON(userData) };
                                                const { checks } = userObject;

                                                const checkPosition = checks.indexOf(checkId);
                                                console.log(checks);
                                                console.log(checkPosition);
                                                if (checkPosition > -1) {
                                                    userObject.checks.splice(checkPosition, 1);
                                                    dataLib.update(
                                                        'users',
                                                        checkObject.userPhone,
                                                        userObject,
                                                        (err5, updatedUser) => {
                                                            if (!err5) {
                                                                callback(200, updatedUser);
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        }
                                    );
                                } else {
                                    callback(403, { error: 'There was an error in server' });
                                }
                            });
                        } else {
                            callback(403, { error: 'Authentication failed' });
                        }
                    }
                );
            } else {
                callback(400, {
                    error: 'No such checks found',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Incomplete data provided',
        });
    }
};

module.exports = handler;
