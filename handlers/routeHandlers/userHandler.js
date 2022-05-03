const { hash, parseJSON } = require('../../helpers/utilities');
const dataLib = require('../../lib/dataLib');
const tokenHandler = require('./tokenHandler');

const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const allowedMethods = ['get', 'post', 'put', 'delete'];

    // check if it is a valid method
    if (allowedMethods.indexOf(requestProperties.method) > -1) {
        handler._user[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._user = {};

handler._user.post = (requestProperties, callback) => {
    // validate all the user registration data
    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

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

    const agreed =
        typeof requestProperties.body.agreed === 'boolean' && requestProperties.body.agreed === true
            ? requestProperties.body.agreed
            : false;

    if (firstName && lastName && phone && password && agreed) {
        // console.log(typeof requestProperties.body);
        const userObject = {
            firstName,
            lastName,
            phone,
            password: hash(password),
            agreed,
        };

        dataLib.read('users', phone, (err, data) => {
            if (!err) {
                callback(500, {
                    error: 'User already registered',
                });
            } else {
                dataLib.create('users', phone, userObject, (err2) => {
                    if (err2) {
                        callback(500, { error: 'User registration failed' });
                    } else {
                        callback(200, {
                            message: 'User created successfully',
                        });
                    }
                });
            }
        });
    } else {
        callback(400, {
            error: 'Incomplete data',
        });
    }
};

handler._user.get = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length >= 11
            ? requestProperties.queryStringObject.phone
            : false;

    if (phone) {
        tokenHandler._token.verify(phone, requestProperties.headerObject.token, (token) => {
            if (token) {
                dataLib.read('users', phone, (err, userData) => {
                    const user = { ...parseJSON(userData) };
                    if (!err && user) {
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(500, {
                            error: 'no such user in database',
                        });
                    }
                });
            } else {
                callback(404, {
                    error: 'Authentication failed',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Data not provided',
        });
    }
};

handler._user.put = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length >= 11
            ? requestProperties.queryStringObject.phone
            : false;

    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length !== 0
            ? requestProperties.body.password
            : false;

    if (phone) {
        tokenHandler._token.verify(phone, requestProperties.headerObject.token, (token) => {
            if (token) {
                dataLib.read('users', phone, (err, userData) => {
                    const user = { ...parseJSON(userData) };

                    if (!err) {
                        if (firstName) {
                            user.firstName = firstName;
                        }
                        if (lastName) {
                            user.lastName = lastName;
                        }
                        if (password) {
                            user.password = hash(password);
                        }
                        // update the user data
                        dataLib.update('users', phone, user, (err2, updatedData) => {
                            if (!err2) {
                                callback(200, updatedData);
                            } else {
                                callback(500, {
                                    error: 'Update failed',
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: 'No user with the number',
                        });
                    }
                });
            } else {
                callback(404, {
                    error: 'Authentication failed',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Incomplete data provided',
        });
    }
};

handler._user.delete = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length >= 11
            ? requestProperties.queryStringObject.phone
            : false;

    if (phone) {
        tokenHandler._token.verify(phone, requestProperties.headerObject.token, (token) => {
            if (token) {
                dataLib.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        dataLib.remove('users', phone, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    message: 'File deleted successfully',
                                });
                            } else {
                                callback(400, {
                                    error: 'File deleting failed',
                                });
                            }
                        });
                    } else {
                        callback(400, {
                            error: 'No such file exist',
                        });
                    }
                });
            } else {
                callback(404, {
                    error: 'Authentication failed',
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
