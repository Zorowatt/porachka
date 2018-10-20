/*

    Frontend logic for the application

*/

// Container for the front end application

const app = {};

// Set config parameters

app.config = {
    'sessionToken' : false,   // При начално зареждане във Броузъра все още няма логнат User.
                            // Това означава, че сървъра все още не е създал/дал активен token,
                            // с който Браузъра да знае че работи с логнат User.
};

// AJAX Client (for RESTful API)
app.client = {}
// Init (bootstrapping)
app.init = function(){

  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // Get the token from localstorage
  app.getSessionToken();

  // Renew token
  app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();

  //Activate Auto Complet on home window
  app.homeAutoComplete();

};

// Call the init processes after the window loads
window.onload = function(){
  app.init();
};
  // Bind each window forms after html reload
app.bindForms = function(){
  if(document.querySelector("form")){
    var allForms = document.querySelectorAll("form");

    for(var i = 0; i < allForms.length; i++){
        allForms[i].addEventListener("submit", function(e){
        e.preventDefault();
        var formId = this.id;  

        //Log in user
        if (formId == "login"){ 
          app.login(formId);
        }
        if (formId == "accountCreate"){
          app.signUp(formId);
        };
        if (formId == "accountEdit"){
          app.accountEdit(formId);
        };
         if (formId == "passwordEdit"){
          app.passwordEdit(formId);
        };
         if (formId == "accountDelete"){
          app.accountDelete(formId);
        }; 
        if (formId == "home"){
          app.home(formId);
        };
        if (formId == "porachkaDelete"){
          app.porachkaDelete(formId);
        };
        if (formId == "porachkaCreate"){
          app.porachkaCreate(formId);
        };
        if (formId == "porachkaEdit"){
          app.porachkaEdit(formId);
        }; 
      });
    }
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function(add,token){
  var target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
      let name = 'myCookie';
      let value = token.id;
      let days= 2;
      var expires = "";
      if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days*24*60*60*1000));
          expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  
  } else {
    target.classList.remove('loggedIn');
    let name = 'myCookie';
    document.cookie = name+'=; Max-Age=-99999999;';
    window.localStorage.removeItem('token');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function(token){
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(typeof(token) == 'object'){
    app.setLoggedInClass(true,token);
  } else {
    app.setLoggedInClass(false);
  }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function(){
  var tokenString = localStorage.getItem('token');
  if(typeof(tokenString) == 'string'){
    try{
      var token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if(typeof(token) == 'object'){
        app.setLoggedInClass(true,token);
      } else {
        app.setLoggedInClass(false);
      }
    }catch(e){
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Bind the logout button
app.bindLogoutButton = function(){
  document.getElementById("logoutButton").addEventListener("click", function(e){

    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    app.logUserOut();

  });
};

// Log the user out then redirect them
app.logUserOut = function(redirectUser){
  // Set redirectUser to default to true
  redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : true;

  // Get the current token id
  var tokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

  // Send the current token to the tokens endpoint to delete it
  var queryStringObject = {
    'id' : tokenId
  };
  app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,function(statusCode,responsePayload){
    // Set the app.config token as false
    app.setSessionToken(false);

    // Send the user to the logged out page
    if(redirectUser){
      localStorage.removeItem('token');
      app.config.sessionToken=false;
      let name = 'myCookie';
      document.cookie = name+'=; Max-Age=-99999999;';
      window.location = '/session/deleted';
    }

  });
};

// Load data on the page
app.loadDataOnPage = function(){
  // Get the current page from the body class
  var bodyClasses = document.querySelector("body").classList;
  var primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  // Logic for account settings page
  if(primaryClass == 'accountEdit'){
    app.loadAccountEditPage();
  }

   // Logic for dashboard page
  if(primaryClass == 'checksList'){
    app.dashboardPage();
  }

  // Logic for porachka details page
  if(primaryClass == 'porachkaEdit'){
    app.loadPorachkaEditPage();
  } 
};

// Load the porachka edit page specifically
app.loadPorachkaEditPage = function(){
  // Get the check id from the query string, if none is found then redirect back to dashboard
  var id = typeof(window.location.href.split('=')[1]) == 'string' && window.location.href.split('=')[1].length > 0 ? window.location.href.split('=')[1] : false;
  
  if(id){
    // Fetch the check data
    var queryStringObject = {
      'id' : id
    };
    app.client.request(undefined,'api/porachki','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){
         // Put the hidden id field into both forms
        var hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
        for(var i = 0; i < hiddenIdInputs.length; i++){
            hiddenIdInputs[i].value = responsePayload.id;
        }
        // Put the data into the top form as values where needed
        document.querySelector("#porachkaEdit .displayIdInput").value = responsePayload.porachkaId;
        document.querySelector("#porachkaEdit .displayTitleInput").value = responsePayload.title;
        document.querySelector("#porachkaEdit .displayAdditionalData").value = responsePayload.additionalData;
        document.querySelector("#porachkaEdit .intval").value = responsePayload.period;
      } else {
        // If the request comes back as something other than 200, redirect back to dashboard
        window.location = '/porachki/all';
      }
    });
  } else {
    window.location = '/porachki/all';
  }
};


// Load the account edit page specifically
app.loadAccountEditPage = function(){
  // Get the phone number from the current token, or log the user out if none is there
  var phone = typeof(app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
  if(phone){
    // Fetch the user data
    var queryStringObject = {
      'phone' : phone
    };
    app.client.request(undefined,'api/users','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit .firstNameInput").value = responsePayload.firstName;
        document.querySelector("#accountEdit .lastNameInput").value = responsePayload.lastName;
        document.querySelector("#accountEdit .displayPhoneInput").value = responsePayload.phone;

        // Put the hidden phone field into both forms
        var hiddenPhoneInputs = document.querySelectorAll("input.hiddenPhoneNumberInput");
        for(var i = 0; i < hiddenPhoneInputs.length; i++){
            hiddenPhoneInputs[i].value = responsePayload.phone;
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

// Load the dashboard page specifically
app.dashboardPage = function(){
  // Get the phone number from the current token, or log the user out if none is there
  var phone = typeof(app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
  if(phone){
    // Fetch the user data
    var queryStringObject = {
      'phone' : phone
    };
    app.client.request(undefined,'api/users','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){

        // Determine how many porachki the user has
        var allPorachki = typeof(responsePayload.porachki) == 'object' && responsePayload.porachki instanceof Array && responsePayload.porachki.length > 0 ? responsePayload.porachki : [];
        
        document.getElementById("createCheckCTA").style.display = 'block';
        if(allPorachki.length > 0){
          var ul = document.getElementById("porachkiList");
          // Show each created porachka 
          
          allPorachki.forEach(function(porachkaId){
            // Get the data for the porachka
            var newQueryStringObject = {
              'id' : porachkaId
            };
            app.client.request(undefined,'api/porachki','GET',newQueryStringObject,undefined,function(statusCode,responsePayload){
              if(statusCode == 200){

                let divTitle = document.createElement('div');
                let divAdditionalData = document.createElement('div');
                let divPeriod = document.createElement('div');
                //let divActive = document.createElement('div');
                let divId = document.createElement('div');
                let anch = document.createElement('a');
                anch.href = '/porachka/edit?id='+ porachkaId;
                anch.innerText = 'Edit';

                divTitle.innerText = responsePayload.title;
                divAdditionalData.innerText = responsePayload.additionalData;
                divPeriod.innerText = responsePayload.period;
                //divActive.innerText = responsePayload.active;
                divId.innerText = porachkaId;

                var outerDiv = document.createElement('div');
                outerDiv.id = porachkaId;
                //innerdiv.innerHTML += payload.additionalData;
                outerDiv.appendChild(divTitle);
                outerDiv.appendChild(divAdditionalData);
                outerDiv.appendChild(divPeriod);
                //outerDiv.appendChild(divActive);
                outerDiv.appendChild(anch);
                outerDiv.appendChild(document.createElement('hr'));
                ul.appendChild(outerDiv);
              } else {
                console.log("Error trying to load porachka ID: ",checkId);
              }
            });
          });

        } else {
          // Show 'you have no checks' message
          //document.getElementById("noChecksMessage").style.display = 'table-row';

          // Show the createCheck CTA
          //document.getElementById("createCheckCTA").style.display = 'block';

        }
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
    
  }
};





// Interface for making API calls
// Тази функция ще се вика винаги когато ще изпращаме рекуест към сървъра
app.client.request = function(headers,path,method,queryStringObject,payload,callback){

  // Set defaults / sanity check
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;

  // For each query string parameter sent, add it to the path
  var requestUrl = path+'?';
  var counter = 0;
  for(var queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       // If at least one query string parameter has already been added, preprend new ones with an ampersand
       if(counter > 1){
         requestUrl+='&';
       }
       // Add the key and value
       requestUrl+=queryKey+'='+queryStringObject[queryKey];
     }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for(var headerKey in headers){
     if(headers.hasOwnProperty(headerKey)){
       xhr.setRequestHeader(headerKey, headers[headerKey]);
     }
  }

  // If there is a current session token set, add that as a header
  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        var statusCode = xhr.status;
        var responseReturned = xhr.responseText;

        // Callback if requested
        if(callback){
          try{
            var parsedResponse = JSON.parse(responseReturned);
            callback(statusCode,parsedResponse);
          } catch(e){
            
            callback(statusCode,false);
          }

        }
      }
  }

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

};

app.signUp = function(formId){

          // @TODO - check and inform if there is logged user already

             // Hide the error message (if it's currently shown due to a previous error)
             document.querySelector("#"+formId+" .formError").style.display = 'none';
             // Hide the success message (if it's currently shown due to a previous error)
            if(document.querySelector("#"+formId+" .formSuccess")){
            document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
            } 
  
            let method = "POST",
            path = '/api/users',
            payload = {};
    
            //var elements = this.elements;
            payload.phone = document.getElementById('phone').value;
            payload.firstName = document.getElementById('firstName').value;
            payload.lastName = document.getElementById('lastName').value;
            payload.password = document.getElementById('password').value;
            payload.tosAgreement = document.getElementById('tosAgreement').checked;
            app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
               // Display an error on the form if needed
               if(statusCode !== 200){
                 
                 if(statusCode == 403){
                   // log the user out
                   app.logUserOut();
                 } else {
                   // Try to get the error from the api, or set a default error message
                   var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
                   // Set the formError field with the error text
                   document.querySelector("#"+formId+" .formError").innerHTML = error;
                   // Show (unhide) the form error field on the form
                   document.querySelector("#"+formId+" .formError").style.display = 'block';
                 }
               } else {
  
                 // @TODO inform that user has been created/signed up
                 //       or redirect the user to the sign up window
                 confirm("User Signed up!");
/*                  var parts = document.referrer.split('://')[1].split('/');
                 var pathName = parts.slice(1).join('/');
                 window.location = '/'+pathName; */ 
                 window.location = '/session/create';
               }
             });
};


app.login = function(formId){
   // Hide the error message (if it's currently shown due to a previous error)
   document.querySelector("#"+formId+" .formError").style.display = 'none';
   // Hide the success message (if it's currently shown due to a previous error)
   if(document.querySelector("#"+formId+" .formSuccess")){
     document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
   } 

   let method = "POST",
       path = '/api/tokens',
       payload = {};

   //var elements = this.elements;
   payload.phone = document.getElementById('phone').value;
   payload.password= document.getElementById('password').value;
   app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
             // Display an error on the form if needed
             if(statusCode !== 200){
               
               if(statusCode == 403){
                 // log the user out
                 app.logUserOut();
               } else {
                 // Try to get the error from the api, or set a default error message
                 var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
                 // Set the formError field with the error text
                 document.querySelector("#"+formId+" .formError").innerHTML = error;
                 // Show (unhide) the form error field on the form
                 document.querySelector("#"+formId+" .formError").style.display = 'block';
               }
             } else {
               // If successful, send to form response processor
               app.setSessionToken(responsePayload);
               var parts = document.referrer.split('://')[1].split('/');
               var pathName = parts.slice(1).join('/');
               
               // @TODO - redirect the user to the previous page, but check
               // for every unnecessary pages to come back, e.i. 'session/deleted'
               if(pathName == 'session/create' || pathName == 'session/deleted'){
               window.location = '/'
               } else {
                window.location = '/'+pathName;;
               }
             }
           });
};

app.accountEdit = function(formId){
             // Hide the error message (if it's currently shown due to a previous error)
             document.querySelector("#"+formId+" .formError").style.display = 'none';
             // Hide the success message (if it's currently shown due to a previous error)
            if(document.querySelector("#"+formId+" .formSuccess")){
            document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
            } 
  
            let method = "PUT",
            path = '/api/users',
            payload = {};
    
            //var elements = this.elements;
            payload.phone = document.getElementById('phone').value;
            payload.firstName = document.getElementById('firstName').value;
            payload.lastName = document.getElementById('lastName').value;
            
            app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
               // Display an error on the form if needed
               if(statusCode !== 200){
                 
                 if(statusCode == 403){
                   // log the user out
                   app.logUserOut();
                 } else {
                   // Try to get the error from the api, or set a default error message
                   var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
                   // Set the formError field with the error text
                   document.querySelector("#"+formId+" .formError").innerHTML = error;
                   // Show (unhide) the form error field on the form
                   document.querySelector("#"+formId+" .formError").style.display = 'block';
                 }
               } else {
                   // @TODO inform that user has changed his accound details
                 confirm("User Details updated!");
               }
             });
};

app.passwordEdit = function(formId){
  // Hide the error message (if it's currently shown due to a previous error)
  document.querySelector("#"+formId+" .formError").style.display = 'none';
  // Hide the success message (if it's currently shown due to a previous error)
 if(document.querySelector("#"+formId+" .formSuccess")){
 document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
 } 

 let method = "PUT",
 path = '/api/users',
 payload = {};
 //var elements = this.elements;
 payload.phone = document.getElementById('phone').value;
 payload.password = document.getElementById('password').value;
 app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
    // Display an error on the form if needed
    if(statusCode !== 200){
      
      if(statusCode == 403){
        // log the user out
        app.logUserOut();
      } else {
        // Try to get the error from the api, or set a default error message
        var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
        // Set the formError field with the error text
        document.querySelector("#"+formId+" .formError").innerHTML = error;
        // Show (unhide) the form error field on the form
        document.querySelector("#"+formId+" .formError").style.display = 'block';
      }
    } else {
        // @TODO inform that user has changed his accound details
      confirm("User Password updated!");
    }
  });
};

app.accountDelete = function(formId){
  let method = "DELETE",
  path = '/api/users',
  payload = {};
  //var elements = this.elements;
  let queryStringObject = {
    'phone':document.getElementById('phone').value
  }
  
  app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
     // Display an error on the form if needed
     if(statusCode !== 200){
       
       if(statusCode == 403){
         // log the user out
         app.logUserOut();
       } else {
         // Try to get the error from the api, or set a default error message
         var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
         // Set the formError field with the error text
         document.querySelector("#"+formId+" .formError").innerHTML = error;
         // Show (unhide) the form error field on the form
         document.querySelector("#"+formId+" .formError").style.display = 'block';
       }
     } else {
         // @TODO inform that user no longer exists
       confirm("User account Deleted");
       app.logUserOut();

     }
   });
};

app.porachkaDelete = function(formId){
  let method = "DELETE",
  path = '/api/porachki';

  let queryStringObject = {
    'id':document.getElementById('pid').value
  }

  app.client.request(undefined,path,method,queryStringObject,undefined,function(statusCode,responsePayload){
     // Display an error on the form if needed
     if(statusCode !== 200){
       
       if(statusCode == 403){
         // log the user out
         app.logUserOut();
       } else {
         // Try to get the error from the api, or set a default error message
         var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
         // Set the formError field with the error text
         document.querySelector("#"+formId+" .formError").innerHTML = error;
         // Show (unhide) the form error field on the form
         document.querySelector("#"+formId+" .formError").style.display = 'block';
       }
     } else {
         
       confirm("Porachkata Deleted");
       var parts = document.referrer.split('://')[1].split('/');
       var pathName = parts.slice(1).join('/');
       window.location = '/'+pathName;;
     }
   });
};

app.porachkaCreate = function(formId){
  let method = "POST",
      path = '/api/porachki',
      payload={};
  payload.title = document.getElementById('title').value;
  payload.additionalData = document.getElementById('additionalData').value;
  payload.period = parseInt(document.getElementById('period').value);
  
  app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
     // Display an error on the form if needed
     if(statusCode !== 200){
       
       if(statusCode == 403){
         // log the user out
         app.logUserOut();
       } else {
         // Try to get the error from the api, or set a default error message
         var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
         // Set the formError field with the error text
         document.querySelector("#"+formId+" .formError").innerHTML = error;
         // Show (unhide) the form error field on the form
         document.querySelector("#"+formId+" .formError").style.display = 'block';
       }
     } else {
         
       confirm("Porachka just Created");
 
       window.location = '/dash/all';
     }
   });
};

app.porachkaEdit = function(formId){
  let method = "PUT",
      path = '/api/porachki',
      payload={};
  payload.id = document.getElementById('pid').value;
  payload.title = document.getElementById('title').value;
  payload.additionalData = document.getElementById('additionalData').value;
  payload.period = parseInt(document.getElementById('period').value);
  
  app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
     // Display an error on the form if needed
     if(statusCode !== 200){
       
       if(statusCode == 403){
         // log the user out
         app.logUserOut();
       } else {
         // Try to get the error from the api, or set a default error message
         var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
         // Set the formError field with the error text
         document.querySelector("#"+formId+" .formError").innerHTML = error;
         // Show (unhide) the form error field on the form
         document.querySelector("#"+formId+" .formError").style.display = 'block';
       }
     } else {
         
       confirm("Porachka just Edited");
 
       window.location = '/dash/all';
     }
   });
};
app.home = function (event){
  let inputSearch = document.getElementById('s1').value;
  document.getElementById('s1').value = document.getElementById('s1').value.trim();
  //@TODO sanity chech of inputSearch
  inputSearch = typeof(inputSearch)=='string' && inputSearch.trim().length >0 ? inputSearch.trim() : false;
  if (inputSearch){
    let method = "GET",
    path = '/porachki/search',
    payload = {};
    let queryStringObject = {
      'search':inputSearch
    };
      app.client.request(undefined,path,method,queryStringObject,undefined,function(stausCode,payload){
          if(stausCode==200){
              document.getElementById("list").innerHTML='';
                payload.forEach(element => {
                  app.client.request(undefined,'api/porachki','get',{'id':element},undefined,function(statusCode,payload){
                      if (statusCode==200){
                          var ul = document.getElementById("list");
                          var div= document.createElement('div');
                          div.id=payload.porachkaId
                          div.className = 'emfi';
                          div.addEventListener('click',function(e){

                            //Вариант със презареждане на цялата страница
                            let location = 'porachki/get?id='+ this.id;
                            //console.log(location)
                            window.location=location;

                            // @TODO - Вариант с презареждане само на body
/*                               app.client.request(undefined,'porachki/dash','get',{'id':this.id},undefined,function(statusCode,payload){
                              if (statusCode==200) {
                                //console.log(payload.obj)
                                let bbb = document.getElementsByClassName('content');
                                console.log(bbb)
                                bbb.innerHTML='<div>dfsdfds</div>';
                                console.log(bbb)
                              } else {
                                //@TODO deal woth the error
                              }
                            }); */

                          });

                          div.innerHTML += payload.title;
                          var innerdiv = document.createElement('div');
                          innerdiv.className = 'inn';
                          innerdiv.innerHTML += payload.additionalData;
                          div.appendChild(innerdiv);
                          ul.appendChild(div);
                          //@TODO - add event click on each div class emfi
                          //@TODO - organize appearance order to be the same any time
                      }
                  });
                });
          }else{
            //@TODO the error show if the server returns another statusCode
          };
      });
    };
};


// Loop to renew token often
app.tokenRenewalLoop = function(){
  setInterval(function(){
    app.renewToken(function(err){
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  },1000 * 60);
};
// Renew the token
app.renewToken = function(callback){
  var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if(currentToken){
    // Update the token with a new expiration
    var payload = {
      'id' : currentToken.id,
      'extend' : true,
    };
    app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
      // Display an error on the form if needed
      if(statusCode == 200){
        // Get the new token details
        var queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if(statusCode == 200){
            app.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};



app.homeAutoComplete = function(){
    // Get the current page from the body class
    var bodyClasses = document.querySelector("body").classList;
    var primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;
  
    // Logic for account settings page
    if(primaryClass == 'index'){

      document.getElementById('s1').addEventListener("keydown", function(event){rrr(event)});
     
      function rrr(e) {
        console.log(e)
        var input = e.target,
            val = input.value;
            list = input.getAttribute('list'),
            options = document.getElementById(list).childNodes;
        for(var i = 0; i < options.length; i++) {
          if(options[i].innerText === val) {
            // An item was selected from the list!
            // yourCallbackHere()
            alert('item selected: ' + val);
            break;
          }
        } 
      }
      
     


      // Add a keyup event listener to our input element
      document.getElementById('s1').addEventListener("input", function(event){hinter(event)});
      // create one global XHR object 
      // so we can abort old requests when a new one is make
      window.hinterXHR = new XMLHttpRequest();


      /*       console.log(document.querySelector('input[list="choose"]'));
      document.querySelector('input[list="choose"]').addEventListener('input', onInput);
      function onInput(e) {
        var input = e.target,
            val = input.value;
            list = input.getAttribute('list'),
            options = document.getElementById(list).childNodes;
        for(var i = 0; i < options.length; i++) {
          if(options[i].innerText === val) {
            // An item was selected from the list!
            // yourCallbackHere()
            alert('item selected: ' + val);
            break;
          }
        } 
      } */


      // Autocomplete for form
      var hinter = function (event) {
         var input = event.target;
        var choose = document.getElementById('choose');
        // minimum number of characters before we start to generate suggestions
        var min_characters = 1;
        if (input.value.length < min_characters ) { 
          return;
        } else { 
          window.hinterXHR.abort();
          window.hinterXHR.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              var response = JSON.parse( this.responseText ); 
              choose.innerHTML = "";
              if (response.length>0 && typeof(response)=='object'){




                response.forEach(function(item) {
                            // Create a new <option> element.
                            var option = document.createElement('option');
                            option.value = item;
                            choose.appendChild(option);
                        });
                
              };
            }
          };
          window.hinterXHR.open("GET", "/query?search=" + input.value, true);
          window.hinterXHR.send()
        }
      }
    }
};





/*   function validateForm(){

  // Get the input element
  var input = document.getElementById('s1');
  // Get the datalist
  var choose = document.getElementById('choose');


  // If we find the input inside our list, we submit the form
  for (var element of choose.children) {
    if(element.value == input.value) {
      return true;
    }
  }

  // we send an error message
  alert("name input is invalid")
  return false;
} */
