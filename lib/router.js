


/*
 Ето тук дефинираме обекта ruter.
 Той ще консултира сървъра за наличен път/сървис

*/

const handlersCommon = require('./handlers/handlersCommon');
const handlerPublic = require('./handlers/handlerPublic');
const handlerIndex = require('./handlers/handlerIndex');
const handlerFavicon = require('./handlers/handlerFavicon');
const handlersUser = require('./handlers/handlersUser');
const handlersToken = require('./handlers/handlersToken')
const handlersSession = require('./handlers/handlersSession');
const handlersPorachki = require('./handlers/handlersPorachki');
const handlersAccount = require('./handlers/handlersAccount');
const handlersDashboard = require('./handlers/handlersDashboard');
// Define all the handlers
const router = {
    '' : handlerIndex.index,
    'account/create' : handlersAccount.create,
    'account/edit' : handlersAccount.edit,
    'account/deleted' : handlersAccount.deleted,
    'session/create' : handlersSession.create,
    'session/deleted' : handlersSession.deleted,
    'dash/all' : handlersDashboard.all,
    'porachka/create' : handlersDashboard.porachkaCreate,
    //'checks/edit' : handlers.checksEdit,
    'ping' : handlersCommon.ping,
    'api/users' : handlersUser.user,
    'api/tokens' : handlersToken.token,
    //'api/checks' : handlers.checks,
    'favicon.ico' : handlerFavicon.favicon,
    'public' : handlerPublic.public,
    'api/porachki' : handlersPorachki.porachki,
    'porachki/search' : handlersPorachki.search,
    'porachki/get' : handlersPorachki.get,
    'porachki/dash' : handlersPorachki.dash
    //'examples/error' : handlers.exampleError

  };

   // Export the module
 module.exports = router;