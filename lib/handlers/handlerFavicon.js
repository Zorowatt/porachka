
const fs=require('fs');
const path=require('path');

const handlerFavicon = {}

// Favicon
handlerFavicon.favicon = function(data,callback){
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Read in the favicon's data
      getStaticAsset('favicon.ico',function(err,data){
        if(!err && data){
          // Callback the data
          callback(200,data,'favicon');
        } else {
          callback(500);
        }
      });
    } else {
      callback(405);
    }
  };

  // Get the contents of a static (public) asset
getStaticAsset = function(fileName,callback){
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

  module.exports = handlerFavicon;