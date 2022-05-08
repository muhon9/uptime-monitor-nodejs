// Dependencies
const http = require('http');
const environment = require('../helpers/environments');
const handleReqRes = require('../helpers/handleReqRes');

// app object - module scaffolding
const server = {};

// create server
server.createServer = () => {
    http.createServer(server.handleReqRes).listen(environment.port, () => {
        console.log(`Server running on port: ${environment.port}`);
    });
};

// handle req and response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
    server.createServer();
};

module.exports = server;
