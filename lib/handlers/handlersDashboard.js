const helpersCommon = require('./helpers/helpersCommon');


let handlersDashboard = {}

handlersDashboard.all = function(data,callback){
  // Reject any request that isn't a GET
  
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Dashboard',
      'body.class' : 'checksList'
    };
    // Read in a template as a string
    helpersCommon.getTemplate('porachkiList',templateData,function(err,str){
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

// Create a new check
handlersDashboard.porachkaCreate = function(data,callback){
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Create a New Check',
        'body.class' : 'checksCreate'
      };
      // Read in a template as a string
      helpersCommon.getTemplate('porachkiCreate',templateData,function(err,str){
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

module.exports = handlersDashboard;