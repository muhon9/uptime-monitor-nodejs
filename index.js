// Dependencies
const http = require('http');
const fs = require('fs');

const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const { remove, create } = require('./lib/dataLib');
const { sendTwilioSms } = require('./helpers/notification');

// app object - module scaffolding
const app = {};

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`Server running on port: ${environment.port}`);
    });
};

sendTwilioSms('01760881213', 'hello', (err, data) => {
    if (!err) {
        console.log(data.message);
    } else {
        console.log(err);
    }
});

// handle req and response
app.handleReqRes = handleReqRes;
// start the server
app.createServer();
