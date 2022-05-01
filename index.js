// Dependencies

const http = require('http');
const url = require('url');

// app object - module scaffolding
const app = {};

// configuaration
app.config = {
    port: 8000,
};

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(app.config.port, () => {
        console.log(`Server running on port: ${app.config.port}`);
    });
};

// handle req and response
app.handleReqRes = (req, res) => {
    console.log('Hello world');
    res.end();
};

// start the server
app.createServer();
