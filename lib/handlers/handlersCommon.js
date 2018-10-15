/*
 * Request Handlers
 *
 */

 /* На всеки handler ще изпращаме формираните данни,
    а когато е изпълнил своята работа той ще ни връща 
    callback със
     - statusCode - как е протекла обработката. Всичко наред ли е или има проблеми
     - payLoad - данните, които ще връщат на Браузъра
     - contentType - типа на тези данни. За да разбере Браузъра как да ги интерпретира
 */

// Dependencies


// Define all the handlers
var handlersCommon = {};


/*
 * JSON API Handlers
 *
 */

 // Ping
 // Този handler връща само statusCode - 200 и служи да идентифицира че сайта е online
 handlersCommon.ping = function(data,callback){
     callback(200);
 };

 
 // Not-Found
 // Този handler връща само statusCode - 404, т.е. указва че сайта не извършва такава услуга
 handlersCommon.notFound = function(data,callback){
   callback(404);
 };






// Export the handlers
module.exports = handlersCommon;