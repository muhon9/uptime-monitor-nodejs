// Dependencies
const server = require('./lib/server');
const worker = require('./lib/worker');

// app object - module scaffolding
const app = {};

// initialize app
app.init = () => {
    // start the server
    server.init();
    // start the worker process
    worker.init();
};

// start the app
app.init();
