const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');

const handler = {};

handler.handleReqRes = (req, res) => {
    // get the requested url and parse it for needed parameters
    const parsedUrl = url.parse(req.url);
    const path = parsedUrl.pathname;
    const trimedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headerObject = req.headers;

    // An object with all necessary info to send to the handlers
    const requestProperties = {
        parsedUrl,
        path,
        trimedPath,
        method,
        queryStringObject,
        headerObject,
    };

    // decode buffer to utf8
    const decoder = new StringDecoder('utf8');
    let realData = '';

    // select route depending on the pathname
    const chosenHandler = routes[trimedPath] ? routes[trimedPath] : notFoundHandler;

    chosenHandler(requestProperties, (statusCode, payload) => {
        // eslint-disable-next-line no-param-reassign
        statusCode = typeof statusCode === 'number' ? statusCode : 500;
        // eslint-disable-next-line no-param-reassign
        payload = typeof payload === 'object' ? payload : {};

        const payloadString = JSON.stringify(payload);
        // return the final response
        res.writeHead(statusCode);
        res.end(payloadString);
    });

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        chosenHandler(requestProperties, (statusCode, payload) => {
            // eslint-disable-next-line no-param-reassign
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            // eslint-disable-next-line no-param-reassign
            payload = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);
            // return the final response
            res.writeHead(statusCode);
            res.end(payloadString);
        });
        res.end();
    });
};

module.exports = handler;
