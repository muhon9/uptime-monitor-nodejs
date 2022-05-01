const { homeHandler } = require('./handlers/routeHandlers/homeHandler');

const routes = {
    '': homeHandler,
    home: homeHandler,
};

module.exports = routes;
