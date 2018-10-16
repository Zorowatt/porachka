/*
 Сега ще направим последната функция по процедурата на заявката,
  която ще получава данните/типа им/статуса от секунданта,
  ще ги добави към приготвения от сървъра отговор
  и ще изпрати отговора към браузъра

*/


// Викаме съответните модули на node js


const http = require('http');
const https = require('https');
const config = require('./config'); // Конфигурационни променливи за нашия web server
const router = require('./router'); // Ще изнеса рутера в отделен модул за по-голямо удобство
const handlersCommon = require('./handlers/handlersCommon');
const handlerPublic = require('./handlers/handlerPublic');

var fs = require('fs'); // Изпозлва се за работа с файловата система на сървъра
var path = require('path'); // Изпозлва се за работа с директориите в файловата система


var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;



// Instantiate the server module object
var server = {};

server.init = function(){
    http.createServer(function(req,res){
      server.unifiedServer(req,res);
    })
    .listen(config.httpPort,function(req,res){
    /*
    * Временно ще подадем функция към функцията за слушане на сървъра,
    * за да може да ни показва в конзолата, на кои портове слушат сървърите
    */
      console.log('\x1b[36m%s\x1b[0m','The HTTP server is running on port '+config.httpPort);
    });
    
     certificate = {
      'key': fs.readFileSync(path.join(__dirname,'.././https/key.pem')),
      'cert': fs.readFileSync(path.join(__dirname,'.././https/cert.pem'))
    };
    https.createServer(certificate,function(req,res){
      server.unifiedServer(req,res);
    })
    .listen(config.httpsPort,function(req,res){

      console.log('\x1b[35m%s\x1b[0m','The HTTPS server is running on port '+config.httpsPort);
    }); 
};


// Това е функцията, която съответния сървър ще изпълни след като получи заявка
// Сървъра ще и подаде req и res
// Тя ще извлече от URL към кой път да поеме заявката и ще я изпрати натам 


server.unifiedServer = function(req,res){

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;
  //@TODO is it neccessary to check for incoming content-type and 
  // to sanitaze only for text/plain or application.json


  // Започваме да сваляме данните от body-то на заявката,
  // Съответно ако има такива
  // Има два верианта:
  // 1. да идва файл който се ъплоадва на сървъра. За сега това няма да го използваме
  //    Това на по-късен етап, ако го разработваме трябва да проверим какво идва от content-type in headers
  // 2. да идват данни под формата на стринг - например: username, password, tokens и т.н.
  //    Този сървър ще приема само стринговани данни
  // Първо ги преобразуваме в UTF-8, а после ги зареждаме в буфер

  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  // Буфера ще се пълни докато не се достави и последния байт информация
  // 'data' е event на функцията req, който се извиква при получаване на данни
  req.on ('data', function(data) {
    buffer += decoder.write(data);
  });

  // 'end' е event на функцията req, който се извиква когато данните са получени
  req.on('end', function() {
    buffer += decoder.end();
      /* До тук сме получили всичко необходимо от заявката
        - headers
        - URI
        - queryString
        - method
        - body-payload , ако има такова
      */

    // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlersCommon.notFound;
  
    // If the request is within the public directory use to the public handler instead
    // This is to serve static resourses
    chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlerPublic.public : chosenHandler;
    
    //@TODO - за сега бодито на POST се проверява единствено са валиден JSON format
    const parseJsonToObject = function(str){
      try{
        let obj = JSON.parse(str);
        return obj;
      } catch (e){
        return {};
      }
    };
    // Construct the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : parseJsonToObject(buffer)
    };
    // Route the request to the handler specified in the router
    try{
      chosenHandler(data,function(statusCode,payload,contentType){
      server.processHandlerResponse(res,method,trimmedPath,statusCode,payload,contentType);
    });
    }catch(e){
      //debug(e);
      //server.processHandlerResponse(res,method,trimmedPath,500,{'Error' : 'An unknown error has occured'},'json');
    }
  });
};


 // Process the response from the handler
 server.processHandlerResponse = function(res,method,trimmedPath,statusCode,payload,contentType){
  // Determine the type of response (fallback to JSON)
  contentType = typeof(contentType) == 'string' ? contentType : 'json';

  // Use the status code returned from the handler, or set the default status code to 200
  statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

  // Return the response parts that are content-type specific
  var payloadString = '';
  if(contentType == 'json'){
    res.setHeader('Content-Type', 'application/json');
    payload = typeof(payload) == 'object'? payload : {};
    payloadString = JSON.stringify(payload);
  }

  if(contentType == 'html'){
    res.setHeader('Content-Type', 'text/html');
    payloadString = typeof(payload) == 'string'? payload : '';
  }
  if(contentType == 'favicon'){
    res.setHeader('Content-Type', 'image/x-icon');
    payloadString = typeof(payload) !== 'undefined' ? payload : '';
  
  }

  if(contentType == 'plain'){
    res.setHeader('Content-Type', 'text/plain');
    payloadString = typeof(payload) !== 'undefined' ? payload : '';
  }

  if(contentType == 'css'){
    res.setHeader('Content-Type', 'text/css');
    payloadString = typeof(payload) !== 'undefined' ? payload : '';
  }

  if(contentType == 'png'){
    res.setHeader('Content-Type', 'image/png');
    payloadString = typeof(payload) !== 'undefined' ? payload : '';
  }

  if(contentType == 'jpg'){
    res.setHeader('Content-Type', 'image/jpeg');
    payloadString = typeof(payload) !== 'undefined' ? payload : '';
  }

  // Return the response-parts common to all content-types
  res.writeHead(statusCode);
  res.end(payloadString);

  // If the response is 200, print green, otherwise print red
  if(statusCode == 200){
    //debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
  } else {
    //debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
  }
};





 



 // Export the module
 module.exports = server;