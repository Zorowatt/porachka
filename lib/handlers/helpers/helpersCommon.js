

const crypto = require('crypto');
const config = require('./../../config');
const path = require('path');
const fs = require('fs');


const helpersCommon = {};

// Create a SHA256 hash
helpersCommon.hash = function(str){
    // Validating the string
    if (typeof(str) == 'string' && str.length>0) {
        const hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    };
};

// Create a string of random alphanumeric characters, of a given length
helpersCommon.createRandomString = function(strLength){
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength){
      // Define all the possible characters that could go into a string
      var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
      // Start the final string
      var str = '';
      for(i = 1; i <= strLength; i++) {
          // Get a random charactert from the possibleCharacters string
          var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
          // Append this character to the string
          str+=randomCharacter;
      }
      // Return the final string
      return str;
    } else {
      return false;
    }
  };



  // Get the string content of a template, and use provided data for string interpolation
  helpersCommon.getTemplate = function(templateName,data,callback){
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data !== null ? data : {};
    if(templateName){
      var templatesDir = path.join(__dirname,'../../../templates/');
      fs.readFile(templatesDir+templateName+'.html', 'utf8', function(err,str){
        if(!err && str && str.length > 0){
            
          // Do interpolation on the string
          var finalString = helpersCommon.interpolate(str,data);
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
  helpersCommon.addUniversalTemplates = function(str,data,callback){
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};
    // Get the header
    helpersCommon.getTemplate('_header',data,function(err,headerString){
      if(!err && headerString){
        // Get the footer
        helpersCommon.getTemplate('_footer',data,function(err,footerString){
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
  helpersCommon.interpolate = function(str,data){
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



module.exports = helpersCommon;