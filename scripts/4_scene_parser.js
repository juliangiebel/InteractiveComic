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

function getImage(url) {
  return new Promise(function(resolve, reset){
    var img = new Image();
    img.src = url;
    img.onload = function(){
      resolve(img);
    };
    img.onerror = function() {
      reject(Error("Couldn't load: "+url));
    };
  });
}

class Scene{
  constructor(img,links){
    this.test = "scene";
    this.view = SingleView.instance;
    this.images = [];
    this.clickEv = [];

    var callback = function(e){
      getJson("resources/" + link).then(this.nextScene);
    };

    this.images.push(new Img(img,0,0));

    for (var link of links) {
      var tmp = {aabb:{x:link.x,y:link.y,bx:(link.x+link.w),by:(link.y+link.h)},callback:callback.bind(this,link)};
      this.clickEv.push(tmp);
      if(link.img)this.images.push(new Img(link.img,link.x,link.y,link.w,link.h));
    }

  }
  init(){
    this.onClick = function(){
      // stateman.pop();
    }.bind(this);

    for (var image of this.images) {
      this.view.add(image);
    }
  }
  resume(){
    this.view.canvas.addEventListener("click", this.onClick, false);

    for (var ev of this.clickEv) {
      EventMgr.onClick.add(ev.aabb,ev.callback);
    }
  }
  update(){
    this.view.draw();
  }
  nextScene(sceneF){
    loadScene(sceneF).then(function(scene) {
      stateman.swap(scene);
    });
  }
  pause(){
    this.view.canvas.removeEventListener("click", this.onClick);
    for (var ev of clickEv) {
      EventMgr.onClick.remove(ev.aabb,ev.callback);
    }
  }
  destruct(){
    for (var image of this.images) {
      //this.view.remove(image);
    }
  }
}
class NormalScene extends Scene{
  constructor(img,data){
    super(img,[{x:0,y:0,bx:SingleView.instance.canvas.width,by:SingleView.instance.canvas.height,link:data.link}]);
  }
}
/**Loads a scene from a json object.
 * @param {object} sceneF the json object containing informationa about a scene.
 * @returns {Promise} A promise returning a {@link Scene} object.
 */
function loadScene(sceneF){
  return new Promise(function(resolve, reject){

    img = new Image();
    console.log(sceneF.img);
    img.src = "resources/" + sceneF.img;

    switch (sceneF.type) {
      case "normal":
      console.log("normal");
        this.scene = new NormalScene(img,sceneF.link);
        img.onload = function(){
          console.log("onload: " + this.scene.test);
          resolve(this.scene);
        }.bind(this);
        break;
      case "interactive":
        //TODO Imlementing interactive scenes.
        scene = new Scene(img,sceneF.links);
        //Load all images in 'links'...
        break;
      case "moving":
        //TODO Implement moving scenes.
        break;
        //NOTE Animiated scenens?
      default:
        //TODO Add error handling for unknown type.
    }

    // if (true) {
    //   resolve();
    // } else {
    //   reject(Error("Temp Error msg"));
    // }
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
