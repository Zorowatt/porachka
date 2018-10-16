const helpersCommon = require('./helpers/helpersCommon');


let handlersSession = {}

// Create New Session
handlersSession.create = function(data,callback){
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Login to your account.',
        'head.description' : 'Please enter your phone number and password to access your account.',
        'body.class' : 'sessionCreate'
      };
      
      // Read in a template as a string
      helpersCommon.getTemplate('sessionCreate',templateData,function(err,str){
        if(!err && str){
          // Add the universal header and footer
          helpersCommon.addUniversalTemplates(str,templateData,function(err,str){
            if(!err && str){
              // Return that page as HTML
              callback(200,str,'html');
            } else {
              callback(500,undefined,'html');
            }
          });
        } else {
          callback(500,undefined,'html');
        }
      });
    } else {
      callback(405,undefined,'html');
    }
  };



// Session has been deleted
handlersSession.deleted = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Logged Out',
      'head.description' : 'You have been logged out of your account.',
      'body.class' : 'sessionDeleted'
    };
    // Read in a template as a string
    helpersCommon.getTemplate('sessionDeleted',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        helpersCommon.addUniversalTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

module.exports = handlersSession;