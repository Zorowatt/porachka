/*
   Library for storing and editing data
   Този модул ще работи с базата данни
   За сега тя ще е във файловата система

*/
//Dependancies
const fs = require('fs');
const path = require('path');
//const helpers = require('./helpers');

// Container for the module to be exported
let dataBase={};
// Defining the base directory where the data lives
dataBase.baseDir = path.join(__dirname, '../../../.dataBase/');

/* Тази помощна функция превръща JSON string в Object, 
    като също така връща грешка, ако получения JSON string е невалиден
*/
// Takes and arbitrary JSON sting to and Object w/o throwing
// this will also checks if request payload is not a JSON sting
const parseJsonToObject = function(str){
/*     let myObj = 
    {
        "firstName":"Katya",
        "lastName":"Dicheva",
        "phone":"0879887659",
        "password":"password",
        "tosAgreement":true
    }
     */

    try{
        let obj = JSON.parse(str);
        return obj;
    } catch (e){
        return {};
    };
};



//Writing data to a file
dataBase.create = function(dir,file,data,callback){
    //Open the file to writing
    fs.open(dataBase.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){
        if (!err && fileDescriptor){
            // Conver data to string
            const stringData = JSON.stringify(data);

            // Create & Write data to a file/database and close the file
            fs.writeFile(fileDescriptor,stringData,function(err){
                if (!err){
                    // Close the file
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false);
                        } else {
                            callback('Error closing the file!');
                        };
                    });
                } else {
                    callback('Error writing to a new file!');
                }; 
            });
        } else {
            callback ('Could not create new user, it may already exist!');
        };
    });
};

// Read data from a file/database
dataBase.read = function (dir,file,callback){
    fs.readFile(dataBase.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        if (!err && data){
            let parsedData = parseJsonToObject(data);
            callback(false,parsedData);
        } else{
        //returns the err flag and the data to whoever its called it
        callback(err,data);
        };
    });
};

// Update data in file/database
dataBase.update = function (dir,file,data,callback){
    // Open the file for writing
    fs.open(dataBase.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
        if (!err && fileDescriptor) {
            // Convert Data to a string
            const stringData = JSON.stringify(data);
            
            //Truncate the file because the data could already exist
            fs.truncate(fileDescriptor,function(err){
                if (!err) {
                    //write the file and close it
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if (!err){
                                    callback(false);
                                }else{
                                    callback('Error closing the file');
                                };
                            })
                        } else {
                            callback('Error writing to an existing file!');
                        };
                    });
                } else {
                    
                };
            });
        } else {
            callback('Could not open the file for updating, it may not exist yet!');
        };
    });
};

// Delete a file/usr from the database
dataBase.delete = function(dir,file,callback){
    // Unlinking(removing) the file from the file system
    fs.unlink(dataBase.baseDir+dir+'/'+file+'.json',function(err){
        if (!err){
            callback(false);
        } else {
            callback('Error deleating the file!');
        };
    });
};


//Export the module
module.exports = dataBase;