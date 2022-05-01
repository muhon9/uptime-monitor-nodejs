const handler = {};

handler.homeHandler = (requestProperties, callback) => {
    callback(200, {
        message: 'This is a home URL',
    });
};

module.exports = handler;
