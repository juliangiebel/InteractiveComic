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
      throw new TypeError("State doesn't contain update function");
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


const MAXWIDTH = 1620;
const MAXHEIGHT = 960;

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

var View = {
  get instance(){
    if(!this._instance){
      this._instance = new _View(document.querySelector("#c"));
    }
    return this._instance;
  }
};

class _View {

   constructor(canvas){
    this.mWidth = MAXWIDTH;
    this.mHeight = MAXHEIGHT;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.elements = [];
   }
   resize(){
     this.canvas.width  = Math.min(window.innerWidth,this.mWidth);
     this.canvas.height = Math.min(window.innerHeight,this.mHeight);
     var styletext = "translate(" +((window.innerWidth - this.canvas.width)/2) +"px, " +((window.innerHeight - this.canvas.height)/2) +"px)";
     this.canvas.style.transform = styletext;
   }
   draw(){
     for (var e of this.elements){
       if(!e.hidden)
       {
         e.draw(this.canvas,this.ctx);
       }
     }
   }
   add(element){
     this.elements.push(element);
   }
}
// Source: scripts/3_scene_parser.js

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
// Source: scripts/x_game.js

class Game{
  constructor(firstScene){
    this.view = View.instance;
    this.scene = firstScene;
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
  pause(){
    this.view.canvas.removeEventListener("click", this.onClick);
  }
  destruct(){

  }
}

stateman.push(new Game());


//Testcode:
var v = View.instance;

function resEvent(){
  v.resize();
}

['resize'].forEach(function(e){
  window.addEventListener(e, resEvent, false);
});

resEvent();
var image = new Image(1200,700);
image.src = "img/sunrise-1756274_640.jpg";
var background = new Img(image,0,0);
v.add(background);
v.draw();
//----------------------------------------------
