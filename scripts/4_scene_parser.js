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
 * @returns {Promise} A promise handling the response from the XMLHttpRequest.
 */
function getJson(url){
  return get(url).then(JSON.parse).catch(function(err){
    return Promise.reject(Error("Error while parsing a file. "+err.message));
  });
}

class Scene{
  constructor(img,links){
    this.view = SingleView.instance;
    this.image = new Image(img,0,0);
    this.clickEv = [];
    for (var link of links) {
      
    }
    // var t = function(link){
    //   getJson(link).then(this.nextScene);
    // }.bind(this);
  }
  init(){
    this.onClick = function(){
      console.log("click");
      stateman.pop();
    }.bind(this);

  }
  resume(){
    this.view.canvas.addEventListener("click", this.onClick, false);
  }
  update(){

  }
  nextScene(sceneF){
    loadScene(sceneF).then(function(scene) {
      stateman.swap(scene);
    });
  }
  pause(){
    this.view.canvas.removeEventListener("click", this.onClick);
  }
  destruct(){

  }
}

/**Loads a scene from a json object.
 * @param {object} sceneF the json object containing informationa about a scene.
 * @returns {Promise} A promise returning a {@link Scene} object.
 */
function loadScene(sceneF){
  return new Promise(function(resolve, reject){

    var scene;

    img = new Image();
    img.src = sceneF.img;

    switch (sceneF.type) {
      case "normal":
        scene = new Scene(img,[sceneF.link]);
        img.onload = function(){
          resolve(this.scene);
        }.bind(this);
        break;
      case "interactive":

        break;
      default:
        //TODO Add error handling for unknown type
    }

    if (true) {
      resolve();
    } else {
      reject(Error("Temp Error msg"));
    }
  });
}
// //Testcode:
// get("tesss.json").then(function(cont){
//   //will never run, there is no file called tesss.json
//   console.log(cont);
// });
//
// getJson("test.json").then(function(cont){
//   console.log("succes!\n" + cont.test);
// });
//
// //---------------------
