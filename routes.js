const { checkHandler } = require('./handlers/routeHandlers/checkHandler');
const { homeHandler } = require('./handlers/routeHandlers/homeHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');

const routes = {
    '': homeHandler,
    home: homeHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

module.exports = routes;
