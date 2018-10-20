/*
  Този handler ще обслужва заявките към User
  - създаване на нов user
  - редактиране на user
  - преглеждане на user
  - изтриване на user

  !! За сега нашата база данни ще бъде файловата система


*/





const dataBase=require('./helpers/dataBase');
const helpers = require('./helpers/helpersCommon');


let handlersUser = {}

//THIS IS THE USER SERVICE
/* Тази функция поема разпределението като насочва към 
 съответната подфункция според типа на заявката.
 Типът на заявката ни указва какво ще се прави с User
*/
handlersUser.user = function(data,callback){
  
  // Figure out what request method is used and is it allowed.
  // Then depends on the used method it will use some subhandlers
  var acceptableMethods = ['post','get','put','delete'];
  //if the data.method exist withing the acceptable methods
  if (acceptableMethods.indexOf(data.method)>-1){
              // by Convention '_' means that these are the private methods 
              // used from the handlersUser.user and are not allowed to be used from someone elses
      _users[data.method](data,callback);
  } else {
      callback(405);
  };
};

/*
 Ще поставим всички подфунции в отделен обект
 Container for the users submethods
*/
let _users = {};

/* IMPORTANT!!! The users will be identified by their phone number.
   Every time we are going to make the TDS- sanity check to check is the user send
   all the required data, before we proceed the request.
*/

// Users - POST (it will be used for creating the new users)
/* Тази функция записва във Базата нов USER, под формата на файл с име неговия телефонен номер
   Също така ще проверява дали има такъв съществуващ User и ще връща Грешка, ако има
   Също така ще проверява и дали всички полета от Браузъра за запълнени и то правилно
*/

/* The required data for every user must have :
   Required data: firstName, lastName, phone, password, tosAgreement
   Optional data: none
*/
_users.post = function(data,callback){
    // Check that all the required fields are filled out - SANITY CHECK
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    if (firstName && lastName && phone && password && tosAgreement){
        // Make sure that the user doesn't already exist in the database
        // before trying to attempt to create him.
        
        dataBase.read('users',phone,function(err,data){ // Проверка за зъществуващ User
          
          if (err){
                // Here we continue if the user phone is unique
                // but first we have to Hash its password, before we copy it into the database

                // Hashing the password
                const hashedPassword = helpers.hash(password);
                // Just in case Error check for hashed password completion
                if (hashedPassword) {

                    // Create the user object for Databse
                    let userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true
                    };
                    
                    //Storing the user into the database
                    dataBase.create('users',phone,userObject,function(err){
                        if(!err){
                            callback(200);
                        } else {
                            callback(500, {'Error':err});
                        }
                    });
                } else {
                    callback(500, {'Error':'Could not hash the user\'s password'});
                };

            } else {
                // Error : user already exists
            callback(400,{'Error' : 'A user with that phone number already exists!'});

            };
        });
    } else {
        callback(400,{'Error' : 'Missing Required Fields!'});
    };

};



// Users - GET
/*
    Тази функция връща данните за потърсения от Броузъра User
*/
/* The required data for every user must have :
    Required data: phone
    Optional data: none
*/
// @TODO - DONE  Only let the authenticated users access their object. Don't let them access anyone elses.
// (the user with existing and active token)

_users.get = function(data,callback){
    //Check that the phone nomber is valid
    //Since it's a GET request and there is no body payload We have to pulled the DATA from the query string of the request insted of the payload of the POST
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {

        //This is from the TODO
        // Since this is the authenticated request the server expects that
        // the token is sent in the header of that requests

        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token:false; 
        //Verify that given token is valid for the phone number
        verifyToken(token, phone, function(tokenIsValid){
            if (tokenIsValid){
                dataBase.read('users',phone,function(err,data){
                    if (!err && data){
                        // Before we return the user data to the requester we have to remove the hashed password from the DATA
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404,{'Error':'The user was not found!'});
                    };
                });
            } else {
                callback(403,{'Error':'Missing required token in header, or the token is invalid/expired!'});
            };
        });
    } else {
        callback(400,{'Error':'Missing Required filed or Wrong phone format (10 didits)'});
    };

};
// Users - PUT
// This is for updating an existing user data
// Required data: phone
// Optional data : firstName, lastName, password (at least one must be specified)
// in PUt request there is a payload already
// @TODO-DONE  Only let the authenticated users upadate their object. Don't let them access anyone elses.
// (the user with existing and active token)

_users.put = function(data,callback){
    //Check for the required field
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    if (phone) {
                //This is from the TODO
        // Since this is the authenticated request the server expects that
        // the token is sent in the header of that requests

        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token:false; 
        //Verify that given token is valid for the phone number
        verifyToken(token, phone, function(tokenIsValid){
            if (tokenIsValid){
                dataBase.read('users',phone,function(err,userData){
                    if (!err && userData){
                        //Check for the optoanal fields
                        let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
                        let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
                        let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
                        //error if nothing is sent to update
                        if (firstName || lastName || password){
                            //update the fields necessary
                            if (firstName){
                                userData.firstName = firstName;
                            }
                            if (lastName){
                                userData.lastName = lastName;
                            }
                            if (password){
                                let hd = helpers.hash(password);
                                if (hd){
                                    userData.hashedPassword = hd;
                                } else {
                                    callback(500, {'Error':'Could not hash the user\'s password'});
                                };
                            };
                            // Updating and storing the user
                            dataBase.update('users',phone,userData,function(err){
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {'Error':'Could not update the user'});
                                };
                            });
                        } else {
                            callback(400,{'Error':'Missing any fields to update!'});
                        };
                    } else {
                        callback(404,{'Error':'The user was not found!'});
                    };
                }); 
            } else {
                callback(403,{'Error':'Missing required token in header, or the token is invalid/expired!'});
            };
        }); 
    } else {
        callback(400,{'Error':'Missing Required filed or Wrong phone format (10 didits)!'});
    };
};

// Users - DELETE
// Required data: phone
// Optional data : none
// @TODO - DONE Only let the authenticated users delete their object. Don't let them delete anyone elses.
// (the user with existing and active token)
// @TODO - DONE Cleanup (delete) any other files assosiated with this user
// (cleanup user active token)
_users.delete = function(data,callback){
    //Check that the phone number is valid
    //Since it's a DELETE request and there is no body payload We have to pulled the DATA from the query string of the request insted of the payload of the POST
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
                //This is from the TODO authentication
        // Since this is the authenticated request the server expects that
        // the token is sent in the header of that requests

        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token:false; 
        //Verify that given token is valid for the phone number
        verifyToken(token, phone, function(tokenIsValid){
            if (tokenIsValid){
                dataBase.read('users',phone,function(err,userData){
                    if (!err && userData){
                        dataBase.delete('users',phone,function(err){
                            if (!err){
                                
                                
                                // This is the second TODO - cleaning all the data the user created
                                // ??????? It may be neccessary to clean up user tokens as well
                                
//                                let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];    
 //                               let checksToDelete = userChecks.length;
                                let checksToDelete=-1;
                                if (checksToDelete>0){
                                    // Counter of checks we deleted
                                    let checksDeleted = 0;
                                    // Count if we have any deletion errors. Kind of exception error
                                    let deletionErrors = false;
                                    // Loop through the checks
                                    userChecks.forEach(function(checkId){
                                        // Delete the check
                                        dataBase.delete('checks',checkId, function(err){
                                            if (err) {
                                                deletionErrors = true;
                                            };
                                            checksDeleted++;
                                            if(checksDeleted == checksToDelete){
                                                if (!deletionErrors) {
                                                    callback(200);
                                                } else {
                                                    callback(500,{'Error':'Errors accounted while attempting to delete all of the user\'s checks. All checks may not have been deleted from the system successfuly!'})
                                                };
                                            };
                                        });
                                    });
                                } else {
                                    callback(200);
                                };
                            }else{
                                callback(500,{'Error':'Could not delete the specified user!'});
                            };
                        });
                    } else {
                        callback(400,{'Error':'Could not find the specified user!'});
                    };
                });
            } else {
                callback(403,{'Error':'Missing required token in header, or the token is invalid/expired!'});
            };
        });
        
    } else {
        callback(400,{'Error':'Missing Required filed or Wrong phone format (10 didits)'});
    };
};



// Verify if a given token id is currently valid for a given user
const verifyToken = function(id,phone,callback){
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
  };


  module.exports = handlersUser;