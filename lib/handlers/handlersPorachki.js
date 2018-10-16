/*

 Записва, дава, променя и изтрива поръчки от базата

*/
const config = require('./../config');
const fs = require('fs');
const helpersCommon = require('./helpers/helpersCommon');
const dataBase = require('./helpers/dataBase');
var path = require('path');

let handlersPorachki = {}

//Porachki

// Required Fields : search - string, start - number
handlersPorachki.search = function(data,callback){
  if(data.method == 'get'){
    let search = typeof(data.queryStringObject.search)=='string' &&  data.queryStringObject.search.trim().length > 0 ? data.queryStringObject.search.trim() : false;
    //let start = typeof(data.queryStringObject.start)=='string' ? parseInt(data.queryStringObject.start) : false;

    if (search){
      fs.readdir(path.join(__dirname,'../.././.dataBase/porachki'),'utf8',function(err,data){
        if (!err){
            onlyDataWithStringInside(search,data,function(err,readyData){
              if (!err) {
                callback(200,readyData);
              }else{
                callback({'Error':'Error when searching DB'})
              }
            }); 
        } else {
          callback(403,{'Error':'Not Found'})
        }
      });
    } else {
      callback(403,{'Error':'Missing required fields in query string!'})
    }
  } else {
    callback(405);
  }
};


let onlyDataWithStringInside = function(search,data,callback){
  let waiting = data.length;
  let found=[];
  let all=[];
  data.forEach(function(file){
        dataBase.read('porachki',file.replace('.json',''),function(err,data){
          //console.log(d)
          if(!err){
            waiting--;
            if (data.title.indexOf(search)>-1 && data.active){
              found.push(data.porachkaId);
            }
            all.push(data.porachkaId);
            if (waiting==0){
              if(found.length !== 0){
                callback(false,found);
              } else {
                callback(false,all);
              }
            }
          } else {
            callback(true,err)
          }

        }) //call finish after each entry
  });
};

// Required fields : id - string (10 digits) into the querystring
handlersPorachki.get = function(data,callback){
  if(data.method == 'get'){
    let id = typeof(data.queryStringObject.id)=='string' &&  data.queryStringObject.id.trim().length ==10 ? data.queryStringObject.id.trim() : false;
    if (id){
        dataBase.read('porachki',id,function(err,data){
          if (!err) {
                  // Prepare data for interpolation
            var templateData = {
              'head.title' : 'Uptime Monitoring - Made Simple',
              'head.description' : 'We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we\'ll send you a text to let you know',
              'body.class' : 'porachka',
              'title' : data.title,
              'additionalData' : data.additionalData,
              'period' : data.period,
              'id': data.porachkaId
            };
            getTemplate('porachka',templateData,function(err,str){
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
            callback(500,{'Error':'Error reading DB'});
          }
        });
    } else {
      callback(403,{'Error':'Missing or wrong requiered fields'});
    }
  } else {
    callback(403,{'Error':'Method Not Allowed'})
  };
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
 


handlersPorachki.dash = function(data,callback){
  if(data.method == 'get'){
    let id = typeof(data.queryStringObject.id)=='string' &&  data.queryStringObject.id.trim().length ==10 ? data.queryStringObject.id.trim() : false;
    if (id){
        dataBase.read('porachki',id,function(err,data){
          if (!err) {
                  // Prepare data for interpolation
            var templateData = {
              'head.title' : 'Uptime Monitoring - Made Simple',
              'head.description' : 'We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we\'ll send you a text to let you know',
              'body.class' : 'porachka',
              'title' : data.title,
              'additionalData' : data.additionalData,
              'period' : data.period,
              'id': data.porachkaId
            };
            getTemplate('porachka',templateData,function(err,str){
              if(!err && str){
                    let obj = {
                      'obj':str
                    }
                    callback(200,obj);

              } else {
                callback(500,undefined,'html');
              }
            });
          } else {
            callback(500,{'Error':'Error reading DB'});
          }
        });
    } else {
      callback(403,{'Error':'Missing or wrong requiered fields'});
    }
  } else {
    callback(403,{'Error':'Method Not Allowed'})
  };
};



handlersPorachki.porachki = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        _porachki[data.method](data,callback);
    } else {
        callback(405);
    }
};


let _porachki = {};


// Required Data : parachkaTitle-sting, *porachkaAdditionalData - string, *porachkaPeriod-number, token(in headers)
// Optional Data : none
_porachki.post = function(data,callback){
    let title = typeof(data.payload.title)=='string' && data.payload.title.trim().length > 0 ? data.payload.title.trim() : false;
    let additionalData = typeof(data.payload.additionalData)=='string' && data.payload.additionalData.trim().length > 0 ? data.payload.additionalData.trim() : '';
    let period = typeof(data.payload.period)=='number' && data.payload.period>0 ? data.payload.period : 3;
    //let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
 
    if (title) {
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        getPhoneFromToken(token,function(phone){
              if(phone){
                  dataBase.read('users',phone,function(err,userData){
                      if (!err && userData){
                        var userPorachki = typeof(userData.porachki) == 'object' && userData.porachki instanceof Array ? userData.porachki : [];
                        let porachkaId = helpersCommon.createRandomString(10);
                        let porackaDB = {
                          'porachkaId' : porachkaId,
                          'title' : title,
                          'additionalData' : additionalData,
                          'period' : period,
                          'active' : true,
                          'user' : phone
                        };
                        dataBase.create('porachki',porachkaId,porackaDB,function(err){
                          if(!err){
                            userData.porachki = userPorachki;
                            userData.porachki.push(porachkaId);

                            dataBase.update('users',phone,userData,function(err){
                              if(!err){
                                // Return the data about the new check
                                callback(200,porackaDB);
                              } else {
                                callback(500,{'Error' : 'Could not update the user with the new check.'});
                              }
                            });
                          } else {
                              callback(500, {'Error':err});
                          }
                        });
                      } else {
                          callback(403);
                      }
                  });
            } else {
              callback(403,{'Error':'Missing required token in header, or the token is invalid/expired!'});
            };
        });
    } else {
        callback(400,{'Error':'Lipsva zaglavieto na porackhata ili telefona na User'});
    }
};


// Required Data : id - of the porachka in queryString
// Optional Data : none
//@TODO - Da se proveri kogato rabotim v MongoDB da niama vazmojnost da se izvikat vsichki porachki
_porachki.get = function(data,callback){
  let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false;
  if (id){
    dataBase.read('porachki',id,function(err,data){
      if (!err && data){
          delete data.user;
          delete data.porachkaId;
          callback(200, data);
      } else {
          callback(404,{'Error':'Не е намерена такава поръчка'});
      };
    });
  } else {
    callback(400,{'Error':'Missing Required filed or Wrong id format (10 didits)'});

  }
};


const getPhoneFromToken = function(token,callback){
  // Lookup the token
  dataBase.read('tokens',token,function(err,tokenData){
    if(!err && tokenData){
      // Check that the token has not expired
      if(tokenData.expires > Date.now()){
        callback(tokenData.phone);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};


module.exports = handlersPorachki;