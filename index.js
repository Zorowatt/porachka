/*
 * Primary file for API
 *
 */

 // Тук ще почистим index.js, като го освободим от сървърната логика
 // Така ще бъде по удобно, кагато сървъра изпълнява и задкулисни функции,
 // които не са свързани със заявките.
 // Просто ще ги подаваме една по една по-надолу

// Dependencies
var server = require('./lib/server');

// Declare the app
var app = {};

// Init function
app.init = function(callback){

  // Start the server
  server.init();

  // Background function can be added here!
  //....

};

// Self invoking only if required directly
if(require.main === module){
  app.init(function(){});
};


// Export the app

module.exports = app;