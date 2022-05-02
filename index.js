// Dependencies
const http = require('http');

const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const { remove, create } = require('./lib/dataLib');

// app object - module scaffolding
const app = {};

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`Server running on port: ${environment.port}`);
    });
};

// handle req and response
app.handleReqRes = handleReqRes;
// start the server
app.createServer();
