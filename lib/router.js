


/*
 Ето тук дефинираме обекта ruter.
 Той ще консултира сървъра за наличен път/сървис

*/

const handlersCommon = require('./handlers/handlersCommon');
const handlerPublic = require('./handlers/handlerPublic');
const handlerIndex = require('./handlers/handlerIndex');
const handlerFavicon = require('./handlers/handlerFavicon');
const handlersUser = require('./handlers/handlersUser');
const handlersToken = require('./handlers/handlersToken');
const handlersPorachki = require('./handlers/handlersPorachki');

// Define all the handlers
const router = {
    '' : handlerIndex.index,
    //'account/create' : handlers.accountCreate,
    //'account/edit' : handlers.accountEdit,
    //'account/deleted' : handlers.accountDeleted,
    //'session/create' : handlers.sessionCreate,
    //'session/deleted' : handlers.sessionDeleted,
    //'checks/all' : handlers.checksList,
    //'checks/create' : handlers.checksCreate,
    //'checks/edit' : handlers.checksEdit,
    'ping' : handlersCommon.ping,
    'api/users' : handlersUser.user,
    'api/tokens' : handlersToken.token,
    //'api/checks' : handlers.checks,
    'favicon.ico' : handlerFavicon.favicon,
    'public' : handlerPublic.public,
    'porachki' : handlersPorachki.porachki,
    'porachki/search' : handlersPorachki.search,
    'porachki/get' : handlersPorachki.get,
    'porachki/dash' : handlersPorachki.dash
    //'examples/error' : handlers.exampleError

  };

   // Export the module
 module.exports = router;