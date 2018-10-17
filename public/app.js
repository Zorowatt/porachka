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

// Interface for makin API calls
// Тази функция ще се вика винаги гогато ще изпращаме рекуест към сървъра
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

app.buttonSearch = function(){
  if(document.getElementById("search")){
    
    document.getElementById("search").addEventListener("touchstart", eventFunction,false);
    document.getElementById("search").addEventListener("click", eventFunction,false);
  };
};
var eventFunction = function (event){

  // Stop it from redirecting anywhere
  event.preventDefault();
  let inputSearch = document.getElementById('s1').value;
  document.getElementById('s1').value = document.getElementById('s1').value.trim();
  //@TODO sanity chech of inputSearch
  inputSearch = typeof(inputSearch)=='string' && inputSearch.trim().length >0 ? inputSearch.trim() : false;
  if (inputSearch){
      app.client.request(undefined,'porachki/search','get',{'search':inputSearch},undefined,function(stausCode,payload){
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
                            console.log(location)
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





  // Bind the forms
app.bindForms = function(){
  if(document.querySelector("form")){

    var allForms = document.querySelectorAll("form");
    for(var i = 0; i < allForms.length; i++){
        allForms[i].addEventListener("submit", function(e){

        // Stop it from submitting
        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector("#"+formId+" .formError").style.display = 'none';

        // Hide the success message (if it's currently shown due to a previous error)
        if(document.querySelector("#"+formId+" .formSuccess")){
          document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
        }


        // Turn the inputs into a payload
        var payload = {};
        var elements = this.elements;
        for(var i = 0; i < elements.length; i++){
          if(elements[i].type !== 'submit'){
            // Determine class of element and set value accordingly
            var classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
            var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
            var elementIsChecked = elements[i].checked;

            var nameOfElement = elements[i].name;

            payload[nameOfElement] = valueOfElement;
            /* // Override the method of the form if the input's name is _method
            
            if(nameOfElement == '_method'){
              method = valueOfElement;
            } else {
              // Create an payload field named "method" if the elements name is actually httpmethod
              if(nameOfElement == 'httpmethod'){
                nameOfElement = 'method';
              }
              // Create an payload field named "id" if the elements name is actually uid
              if(nameOfElement == 'uid'){
                nameOfElement = 'id';
              }
              // If the element has the class "multiselect" add its value(s) as array elements
              if(classOfElement.indexOf('multiselect') > -1){
                if(elementIsChecked){
                  payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                  payload[nameOfElement].push(valueOfElement);
                }
              } else {
                payload[nameOfElement] = valueOfElement;
              }

            }
           */}
        }


        // If the method is DELETE, the payload should be a queryStringObject instead
        var queryStringObject = method == 'DELETE' ? payload : {};

        // Call the API
        app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
          // Display an error on the form if needed
          console.log(435)
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
            app.formResponseProcessor(formId,payload,responsePayload);
          }

        });
      });
    }
  }
};
// Form response processor
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  var functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if(formId == 'accountCreate'){
    window.location = '/session/create';


    /* // Take the phone and password, and use it to log the user in
    var newPayload = {
      'phone' : requestPayload.phone,
      'password' : requestPayload.password
    };

    app.client.request(undefined,'api/tokens','POST',undefined,newPayload,function(newStatusCode,newResponsePayload){
      // Display an error on the form if needed
      if(newStatusCode !== 200){

        // Set the formError field with the error text
        document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

        // Show (unhide) the form error field on the form
        document.querySelector("#"+formId+" .formError").style.display = 'block';

      } else {
        // If successful, set the token and redirect the user
        app.setSessionToken(newResponsePayload);


        // @TODO - reload last location window after account has been created
                 
        window.location = '/checks/all';
      }
    }); */
  }
  // If login was successful, set the token in localstorage and redirect the user
  if(formId == 'sessionCreate'){
    
    app.setSessionToken(responsePayload);
    window.location = '/';
  }

  // If forms saved successfully and they have success messages, show them
  var formsWithSuccessMessages = ['accountEdit1', 'accountEdit2','checksEdit1'];
  if(formsWithSuccessMessages.indexOf(formId) > -1){
    document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
  }

  // If the user just deleted their account, redirect them to the account-delete page
  if(formId == 'accountEdit3'){
    app.logUserOut(false);
    window.location = '/account/deleted';
  }

  // If the user just created a new check successfully, redirect back to the dashboard
  if(formId == 'checksCreate'){
    window.location = '/dash/all';
  }

  // If the user just deleted a check, redirect them to the dashboard
  if(formId == 'checksEdit2'){
    window.location = '/checks/all';
  }

};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function(add){
  var target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function(token){
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(typeof(token) == 'object'){
    app.setLoggedInClass(true);
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
        app.setLoggedInClass(true);
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





/*
  // Logic for check details page
  if(primaryClass == 'checksEdit'){
    app.loadChecksEditPage();
  } */
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
        document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
        document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
        document.querySelector("#accountEdit1 .displayPhoneInput").value = responsePayload.phone;

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

                divTitle.innerText = responsePayload.title;
                divAdditionalData.innerText = responsePayload.additionalData;
                divPeriod.innerText = responsePayload.period;
                //divActive.innerText = responsePayload.active;
                divId.innerText = porachkaId;

                //div.id=porachkaId
                //div.className = 'emfi';
/*                 div.addEventListener('click',function(e){

                  //Вариант със презареждане на цялата страница
                  let location = 'porachki/get?id='+ this.id;
                  console.log(location)
                  window.location=location;
                }); */

                //div.innerHTML += payload.title;

                var outerDiv = document.createElement('div');
                outerDiv.id = porachkaId;
                //innerdiv.innerHTML += payload.additionalData;
                outerDiv.appendChild(divTitle);
                outerDiv.appendChild(divAdditionalData);
                outerDiv.appendChild(divPeriod);
                //outerDiv.appendChild(divActive);
                outerDiv.appendChild(document.createElement('hr'));
                ul.appendChild(outerDiv);
              } else {
                console.log("Error trying to load porachka ID: ",checkId);
              }
            });
          });

          //if(allPorachki.length < 5){
            // Show the createCheck CTA
            //document.getElementById("createCheckCTA").style.display = 'block';
          //}

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



// Init (bootstrapping)
app.init = function(){

  app.buttonSearch();


  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // Get the token from localstorage
  app.getSessionToken();

  // Renew token
//  app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = function(){
  app.init();
};