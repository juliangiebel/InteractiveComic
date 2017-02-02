/*jshint esversion: 6 */
/**Requests a file as plain text from the server.
 * @param {string} url The url of the file to be loaded.
 * @returns {Promise} The Promise handling the response from the XMLHttpRequest.
 */
function get(url){
  return new Promise(function(resolve,reject){
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET",url,true);
    //React to response
    xhttp.onload = function() {
          if (xhttp.status == 200) {
              resolve(xhttp.responseText);
         }else{
           reject(Error(xhttp.statusText));
         }
      };
    //Handle network errors
    xhttp.onerror = function() {
      reject(Error("Network Error"));
    };
    //Make the request
    xhttp.send();
  });
}

/**Requests a JSON file from the server.
 * Adds an extra step to the {@link get} function, parsing the response into a JSON object.
 * @param {string} url The url of the file to be loaded.
 * @returns {Promise} The Promise handling the response from the XMLHttpRequest.
 */
function getJson(url){
  return get(url).then(JSON.parse).catch(function(err){
    return Promise.reject(Error("Error while parsing a file. "+err.message));
  });
}

var SceneLoader = new Promise(function(resolve, reject,src){

  if (true) {
    resolve();
  } else {
    reject(Error("Temp Error msg"));
  }
});

//Testcode:
get("tesss.json").then(function(cont){
  //will never run, there is no file called tesss.json
  console.log(cont);
});

getJson("test.json").then(function(cont){
  console.log("succes!\n" + cont.test);
});

//---------------------
