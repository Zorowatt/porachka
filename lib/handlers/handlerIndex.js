/*
 Този handler връща началната страница на сайта

*/

const config = require('./../config');
const fs=require('fs');
const path=require('path');

var handlerIndex = {};


// Index
handlerIndex.index = function(data,callback){
   
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Uptime Monitoring - Made Simple',
        'head.description' : 'We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we\'ll send you a text to let you know',
        'body.class' : 'index'
      };
      
      // Read in a template as a string
      getTemplate('index',templateData,function(err,str){
        if(!err && str){
          // Add the universal header and footer
          addUniversalTemplates(str,templateData,function(err,str){
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


  // Get the string content of a template, and use provided data for string interpolation
getTemplate = function(templateName,data,callback){
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data !== null ? data : {};
    if(templateName){
      var templatesDir = path.join(__dirname,'/../../templates/');
      fs.readFile(templatesDir+templateName+'.html', 'utf8', function(err,str){
        if(!err && str && str.length > 0){
          // Do interpolation on the string
          var finalString = interpolate(str,data);
          callback(false,finalString);
        } else {
          callback('No template could be found');
        }
      });
    } else {
      callback('A valid template name was not specified');
    }
  };
  
  // Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
  addUniversalTemplates = function(str,data,callback){
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};
    // Get the header
    getTemplate('_header',data,function(err,headerString){
      if(!err && headerString){
        // Get the footer
        getTemplate('_footer',data,function(err,footerString){
          if(!err && headerString){
            // Add them all together
            var fullString = headerString+str+footerString;
            callback(false,fullString);
          } else {
            callback('Could not find the footer template');
          }
        });
      } else {
        callback('Could not find the header template');
      }
    });
  };
  
  // Take a given string and data object, and find/replace all the keys within it
  interpolate = function(str,data){
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};
  
    // Add the templateGlobals to the data object, prepending their key name with "global."
    for(var keyName in config.templateGlobals){
       if(config.templateGlobals.hasOwnProperty(keyName)){
         data['global.'+keyName] = config.templateGlobals[keyName]
       }
    }
    // For each key in the data object, insert its value into the string at the corresponding placeholder
    for(var key in data){
       if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){
          var replace = data[key];
          var find = '{'+key+'}';
          str = str.replace(find,replace);
       }
    }
    return str;
  };
  





  module.exports = handlerIndex;