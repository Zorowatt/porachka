    
    const dataBase=require('./helpers/dataBase');
    const helpers = require('./helpers/helpersCommon');
//    const _performance = require('perf_hooks').performance;
//    const util = require('util');
//    const debug = util.debuglog('performance')
    

    let handlersToken = {};
    // Tokens
    handlersToken.token = function(data,callback){
        var acceptableMethods = ['post','get','put','delete'];
        console.log(data);
        if(acceptableMethods.indexOf(data.method) > -1){
        _tokens[data.method](data,callback);
        } else {
            
        callback(405);
        }
    };
    

    // Container for all the tokens methods
    let _tokens  = {};
    
    // Tokens - post
    // Required data: phone, password
    // Optional data: none
    _tokens.post = function(data,callback){
        
    //    _performance.mark('entered function');
        var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
        var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    //    _performance.mark('inputs validated');
        if(phone && password){
        // Lookup the user who matches that phone number
    //    _performance.mark('beginning user lookup');
        dataBase.read('users',phone,function(err,userData){
    //        _performance.mark('user lookup complete');
            if(!err && userData){
            // Hash the sent password, and compare it to the password stored in the user object
    //        _performance.mark('beginning password hashing');
            var hashedPassword = helpers.hash(password);
    //        _performance.mark('password hashing complete');
            if(hashedPassword == userData.hashedPassword){
                // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
    //            _performance.mark('creating data for token');
                var tokenId = helpers.createRandomString(20);
                var expires = Date.now() + 1000 * 60 * 60;
                var tokenObject = {
                'phone' : phone,
                'id' : tokenId,
                'expires' : expires
                };
    
                // Store the token
    //            _performance.mark('beginning storing token');
                dataBase.create('tokens',tokenId,tokenObject,function(err){
    //            _performance.mark('storing token complete');
                // Gather all measurements
    //            _performance.measure('Beginning to end', 'entered function', 'storing token complete');
    //            _performance.measure('Validating user inputs', 'entered function', 'inputs validated');
    //            _performance.measure('User lookup', 'beginning user lookup', 'user lookup complete');
    //            _performance.measure('Password hashing', 'beginning password hashing', 'password hashing complete');
    //            _performance.measure('Token data creation','creating data for token', 'beginning storing token');
    //            _performance.measure('Token storing','beginning storing token', 'storing token complete');
    
                // Log out all the measurements
    //            var measurements = _performance.getEntriesByType('measure');
    //            measurements.forEach(function(measurement){
    //                debug('\x1b[33m%s\x1b[0m',measurement.name+' '+measurement.duration);
    //            }); 
                if(!err){
                    callback(200,tokenObject);
                } else {
                    callback(500,{'Error' : 'Could not create the new token'});
                }
                });
            } else {
                callback(400,{'Error' : 'Password did not match the specified user\'s stored password'});
            }
            } else {
            callback(400,{'Error' : 'Could not find the specified user.'});
            }
        });
        } else {
        callback(400,{'Error' : 'Missing required field(s).'})
        }
    };
    
    // Tokens - get
    // Required data: id
    // Optional data: none
    _tokens.get = function(data,callback){
        // Check that id is valid
        var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
        if(id){
        // Lookup the token
        dataBase.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
            callback(200,tokenData);
            } else {
            callback(404);
            }
        });
        } else {
        callback(400,{'Error' : 'Missing required field, or field invalid'})
        }
    };
    
    // Tokens - put
    // Required data: id, extend
    // Optional data: none
    _tokens.put = function(data,callback){
        var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
        var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
        if(id && extend){
        // Lookup the existing token
        dataBase.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                // Check to make sure the token isn't already expired
                if(tokenData.expires > Date.now()){
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // Store the new updates
                    dataBase.update('tokens',id,tokenData,function(err){
                    if(!err){
                        callback(200);
                    } else {
                        callback(500,{'Error' : 'Could not update the token\'s expiration.'});
                    }
                    });
                } else {
                    callback(400,{"Error" : "The token has already expired, and cannot be extended."});
                }
            } else {
            callback(400,{'Error' : 'Specified user does not exist.'});
            }
        });
        } else {
        callback(400,{"Error": "Missing required field(s) or field(s) are invalid."});
        }
    };
    
    
    // Tokens - delete
    // Required data: id
    // Optional data: none
    _tokens.delete = function(data,callback){
        // Check that id is valid
        var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
        if(id){
        // Lookup the token
        dataBase.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
            // Delete the token
            dataBase.delete('tokens',id,function(err){
                if(!err){
                callback(200);
                } else {
                callback(500,{'Error' : 'Could not delete the specified token'});
                }
            });
            } else {
            callback(400,{'Error' : 'Could not find the specified token.'});
            }
        });
        } else {
        callback(400,{'Error' : 'Missing required field'})
        }
    };
    
/*     // Verify if a given token id is currently valid for a given user
    let verifyToken = function(id,phone,callback){
        // Lookup the token
        dataBase.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
            // Check that the token is for the given user and has not expired
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
            callback(true);
            } else {
            callback(false);
            }
        } else {
            callback(false);
        }
        });
    }; */

    module.exports = handlersToken;