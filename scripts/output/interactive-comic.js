/*jshint esversion: 6 */// Source: scripts/0_base.js

var stateStack = [];
var stateman = {
  init: function(){

  },
  update: function(){
    if(stateStack.length <= 0) return;
    stateStack[stateStack.length -1].update();
  },
  push: function(state){
    if(state.update === undefined){
      throw new TypeError("State doesn't contain an update function");
    }
    if(stateStack.length > 0) stateStack[stateStack.length -1].pause();

    stateStack.push(state);
    state.init();
    state.resume();
  },
  pop: function(){
    if(stateStack.length <= 0) return;
    var lState = stateStack.pop();
    lState.pause();
    lState.destruct();
    if(stateStack.length > 0) stateStack[stateStack.length -1].resume();

    return lState;
  },
  swap: function(state){
    var tmp = this.pop();
    try {
      this.push(state);
    }catch (e) {
      this.push(tmp);
      throw Error("Error during state swap: "+e.message);
    }
  },
  destruct: function(){
    stateStack.forEach(function(e){e.pause();e.destruct();});
    stateStack = [];
  }
};

var upInterval = setInterval(stateman.update,20);
// Source: scripts/1_gpc_obj.js

//Abstract
class GElement {
  constructor(_x,_y){
    if (new.target === GElement) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }

    this.hidden = false;
    this.position = {x:_x,y:_y};
  }

}

class Img extends GElement{
  constructor(image,x,y,width,height,cx,cy,cWidth,cHeight){
    super(x,y);
    this.image = image;
    this.width = width;
    this.height = height;
    this.cx = cx;
    this.cy = cy;
    this.cWidth = cWidth;
    this.xHeight = cHeight;
  }

  draw(canvas,ctx){
    if(this.width === undefined || this.height === undefined){
      this.width = canvas.width;
      this.height = canvas.height;
    }
    ctx.drawImage(this.image,this.position.x,this.position.y,this.width,this.height);
  }

}
// Source: scripts/2_view.js


// var c = document.querySelector("#c");
// var ctx = c.getContext("2d");
//
// var image = new Image(1200,700);
//
// function resize() {
//   c.width  = Math.min(window.innerWidth,MAXWIDTH);
//   c.height = Math.min(window.innerHeight, MAXHEIGHT);
//   var styletext = "translate(" +((window.innerWidth - c.width)/2) +"px, " +((window.innerHeight - c.height)/2) +"px)";
//   document.getElementById("c").style.transform = styletext;
// }
//
// c.onload   = resize();
// window.addEventListener("resize", resize, false);
//
// image.onload = function() {
//   ctx.drawImage(image,0,0,c.width,c.height);
//   console.log("Loaded image");
// };
//
// image.src = "img/sunrise-1756274_640.jpg";

const MAXWIDTH = 1920;
const MAXHEIGHT = 1080;

var SingleView = {
  get instance(){
    if(!this._instance){
      this._instance = new View(document.querySelector("#c"));
    }
    return this._instance;
  }
};


/**Class handling a canvas and elements drawn onto it.*/
class View {

  /**Creates a view
   * @param {Object} canvas The canvas to be handled.
   * @param {number} [maxWidth] Maximum width the canvas can have.
   * @param {number} [maxHeight] Maximum height the canvas can have.
   */
   constructor(canvas, maxWidth, maxHeight){
    this.mWidth = maxWidth||MAXWIDTH;
    this.mHeight = maxHeight||MAXHEIGHT;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.elements = [];
   }
   getRatio(){
     //adjusted height = <user-chosen width> * original height / original width
     //adjusted width = <user-chosen height> * original width / original height
     return this.mWidth / this.mHeight;
   }
   /**Resizes the canvas to match the window size or maxWidth/maxHeight*/
   resize(){
    //HACK Hacked in aspect ratio!
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerWidth / this.getRatio();
    this.ctx.scale(1.15/(this.mWidth/this.canvas.width),1.15/(this.mHeight/this.canvas.height));
    var styletext = "translate(" +((window.innerWidth - this.canvas.width)/2) +"px, " +((window.innerHeight - this.canvas.height)/2) +"px)";
    this.canvas.style.transform = styletext;
   }
   /**Draws all elements.*/
   draw(){
     for (var e of this.elements){
       if(!e.hidden)
       {
         e.draw(this.canvas,this.ctx);
       }
     }
   }
   /**Adds Element to the list of elemnts to be drawn.
    * @param {object} element Any object containing a Draw function.
    */
   add(element){
     //TODO Add error handling for when element doesn't contain a draw function.
     this.elements.push(element);
   }
   //TODO Add a function that removes an element from the list of elements.
}
// Source: scripts/3_events.js

function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return {x,y};
}

var EventMgr = {
  onClick: (function(){
  var handlers = [];
  var scaleModyfier = 1;
  var sort = function() {
    handlers.sort(function(a,b){return (a.x + a.y)-(b.x + b.y);});
  };
  var evCall = function(e){
    var pos = getCursorPosition(SingleView.instance.canvas,e);
    console.log("Click: " + pos.x +"|"+pos.y);
    for (var handle of handlers){
      if(scale(handle.aabb.x) < pos.x && pos.x < scale(handle.aabb.bx) && scale(handle.aabb.y) < pos.y && pos.y < scale(handle.aabb.by)) handle.callback(e);
    }
  }.bind(this);
  var scale = function(number) {
    return number*scaleModyfier;
  };
  //constructor:
  SingleView.instance.canvas.addEventListener("click", evCall, false);

  return {
    add: function(aabb,callback) {
      handlers.push({aabb,callback});
      sort();
    },
    remove: function(aabb,callback) {
      //TODO Add error handling.
      handlers.splice(handlers.indexOf({aabb,callback}),1);
      sort();
    },
    setScale: function(scale){
      scale = scale;
    }
  };
})()};
// //Testcode:
// var testcb = function() {
//   console.log("Click: invisible box");
//   EventMgr.onClick.remove({x:20,y:20,bx:60,by:60},testcb);
// }.bind(this,testcb);
// EventMgr.onClick.add({x:20,y:20,bx:60,by:60},testcb);
// //--------------
// Source: scripts/4_utils.js

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
    this.mg = new Image();
    mg.src = url;
    mg.onload = function(){
      resolve(this.mg);
    }.bind(this);
    mg.onerror = function() {
      reject(Error("Couldn't load: "+url));
    };
  });
}

function createSequence(list,promise) {
  return Promise.all(list.map(promise));
}

// //Testcode:
// createSequence(["test.json","test.json","test.json","test.json","test.json","test.json"],(entry) => {
//   return Promise.resolve("hi");
// }).then(function(ret) {
//   console.log("test:" + ret);
// });
// //------------------
// Source: scripts/5_scene_parser.js

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

    console.log(sceneF.img);

    switch (sceneF.type) {
      case "normal":
        console.log("normal");
        getImage("resources/" + sceneF.img).then(function(ret){
          console.log(ret);
          this.scene = new NormalScene(ret,sceneF.link);
          console.log("onload: " + this.scene.test);
          resolve(this.scene);
        });
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
// Source: scripts/x_game.js




//Testcode:
var v = SingleView.instance;

function resEvent(){
  v.resize();
}

['resize'].forEach(function(e){
  window.addEventListener(e, resEvent, false);
});

resEvent();
// var image = new Image();
// image.src = "img/sunrise-1756274_640.jpg";
// var background = new Img(image,0,0);
// v.add(background);
// v.draw();

getJson("resources/scene1.json").then(function(cont) {
  loadScene(cont).then(function(testScene){
  stateman.push(testScene);
});});

//----------------------------------------------
class Test{
  constructor(id){
    this.id = id;
    console.log("test state: "+id);

  }
  init(){
    this.onClick = function(){
      console.log("click "+this.id);
      stateman.pop();
    }.bind(this);

  }
  resume(){
    console.log("test resume: "+this.id);
    SingleView.instance.canvas.addEventListener("click", this.onClick, false);
  }
  update(){

  }
  nextScene(sceneF){
    loadScene(sceneF).then(function(scene) {
      stateman.swap(scene);
    });
  }
  pause(){
    console.log("test pause: "+this.id);
    SingleView.instance.canvas.removeEventListener("click", this.onClick);
  }
  destruct(){

  }
}
// stateman.push(new Test(1));
// setTimeout(function () {
//   stateman.swap(new Test(2));
// }, 1);
//----------------------------------------------
