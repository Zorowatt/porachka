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
    document.getElementById("search").addEventListener("click", function(e){

      // Stop it from redirecting anywhere
      e.preventDefault();
      let inputSearch = document.getElementById('s1').value;
      document.getElementById('s1').value = document.getElementById('s1').value.trim();
      //@TODO sanity chech of inputSearch
      inputSearch = typeof(inputSearch)=='string' && inputSearch.trim().length >0 ? inputSearch.trim() : false;
      if (inputSearch){
          app.client.request(undefined,'porachki/search','get',{'search':inputSearch},undefined,function(stausCode,payload){
              if(stausCode==200){
                  document.getElementById("list").innerHTML='';
                    payload.forEach(element => {
                      app.client.request(undefined,'porachki','get',{'id':element},undefined,function(statusCode,payload){
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
            // Override the method of the form if the input's name is _method
            var nameOfElement = elements[i].name;
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
          }
        }


        // If the method is DELETE, the payload should be a queryStringObject instead
        var queryStringObject = method == 'DELETE' ? payload : {};

        // Call the API
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
            // If successful, send to form response processor
            app.formResponseProcessor(formId,payload,responsePayload);
          }

        });
      });
    }
  }
};



// Init (bootstrapping)
app.init = function(){

  app.buttonSearch();


  // Bind all form submissions
//  app.bindForms();

  // Bind logout logout button
//  app.bindLogoutButton();

  // Get the token from localstorage
//  app.getSessionToken();

  // Renew token
//  app.tokenRenewalLoop();

  // Load data on page
//  app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = function(){
  app.init();
};