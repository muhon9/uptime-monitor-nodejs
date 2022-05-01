const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(500, {
        message: 'Page not found',
    });
};

module.exports = handler;
