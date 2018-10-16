const helpersCommon = require('./helpers/helpersCommon');


let handlersAccount = {}

handlersAccount.create = function(data,callback){
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Create an Account',
        'head.description' : 'Signup is easy and only takes a few seconds.',
        'body.class' : 'accountCreate'
      };
      // Read in a template as a string
      helpersCommon.getTemplate('accountCreate',templateData,function(err,str){
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

  // Edit Your Account
  handlersAccount.edit = function(data,callback){
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Account Settings',
        'body.class' : 'accountEdit'
      };
      // Read in a template as a string
      helpersCommon.getTemplate('accountEdit',templateData,function(err,str){
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


// Account has been deleted
handlersAccount.deleted = function(data,callback){
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Account Deleted',
        'head.description' : 'Your account has been deleted.',
        'body.class' : 'accountDeleted'
      };
      // Read in a template as a string
      helpersCommon.getTemplate('accountDeleted',templateData,function(err,str){
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


module.exports = handlersAccount;