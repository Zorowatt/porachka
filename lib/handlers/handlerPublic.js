/*
 Този handler ще връща директно всеки файл, който се намира в 
 публичнта директория.
 Това са файлове, които позволяваме директно Браузъра да получава
 например: html, css, js, images ...


*/
// Dependencies
var path = require('path');
var fs = require('fs');


var handlerPublic = {};

handlerPublic.public = function(data,callback){
   
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Get the filename being requested
      var trimmedAssetName = data.trimmedPath.replace('public/','').trim();
      if(trimmedAssetName.length > 0){
        // Read in the asset's data
        getStaticAsset(trimmedAssetName,function(err,data){
            
          if(!err && data){
  
            // Determine the content type (default to plain text)
            var contentType = 'plain';
  
            if(trimmedAssetName.indexOf('.css') > -1){
              contentType = 'css';
            }
  
            if(trimmedAssetName.indexOf('.png') > -1){
              contentType = 'png';
            }
  
            if(trimmedAssetName.indexOf('.jpg') > -1){
              contentType = 'jpg';
            }
  
            if(trimmedAssetName.indexOf('.ico') > -1){
              contentType = 'favicon';
            }
  
            // Callback the data
            callback(200,data,contentType);
          } else {
            callback(404);
          }
        });
      } else {
        callback(404);
      }
  
    } else {
      callback(405);
    }
  };
  

  // Get the contents of a static (public) asset
const getStaticAsset = function(fileName,callback){
    fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
    if(fileName){
      var publicDir = path.join(__dirname,'/../../public/');
      fs.readFile(publicDir+fileName, function(err,data){
        if(!err && data){
          callback(false,data);
        } else {
          callback('No file could be found');
        }
      });
    } else {
      callback('A valid file name was not specified');
    }
  };

  // Export the handler
module.exports = handlerPublic;