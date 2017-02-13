/*jshint esversion: 6 */// Source: scripts/0_base.js


//Globals:
const DEBUG = true;
//--------------

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

var upInterval = setInterval(stateman.update,30);
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
    ctx.drawImage(this.image,this.position.x,this.position.y,this.width||canvas.width,this.height||canvas.height);
  }

}

class Rect extends GElement{
  constructor(x,y,w,h,fill){
    super(x,y);
    this.w = w;
    this.h = h;
    this.fill = fill||false;
  }
  draw(canvas,ctx){
    if(this.fill){
      ctx.fillRect(this.position.x,this.position.y,this.w,this.h);
    }else{
      ctx.strokeRect(this.position.x,this.position.y,this.w,this.h);
    }
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
   getScale(){
     return {x: 1/(this.mWidth/this.canvas.width),y: 1/(this.mHeight/this.canvas.height)};
   }
   /**Resizes the canvas to match the window size or maxWidth/maxHeight*/
   resize(){
    //HACK Hacked in aspect ratio!
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerWidth / this.getRatio();
    this.scale = this.getScale();
    this.ctx.scale(this.scale.x,this.scale.y);
    EventMgr.setScale(this.scale.x,this.scale.y);
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
   deleteAll(){
     this.elements = [];
   }
}
// Source: scripts/3_events.js

function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return {x,y};
}
var _eventmgrscale = {x:1,y:1};
var _eventmgrxoffset = 0;
var EventMgr = {
  setScale: function(scalex, scaley){
    _eventmgrscale.x = scalex;
    _eventmgrscale.y = scaley;
  },
  offset: function (x) {
    _eventmgrxoffset = x;
  },
  onClick: (function(){
  var handlers = [];
  var sort = function() {
    handlers.sort(function(a,b){return (a.x + a.y)-(b.x + b.y);});
  };
  var evCall = function(e){
    var pos = getCursorPosition(SingleView.instance.canvas,e);
    console.log("Click: " + pos.x +"|"+pos.y+"|"+handlers.length+"|"+(pos.x+_eventmgrxoffset));
    for (var handle of handlers){
      if((handle.aabb.x*_eventmgrscale.x) < (pos.x-_eventmgrxoffset) && (pos.x-_eventmgrxoffset) < (handle.aabb.bx*_eventmgrscale.x) &&
        (handle.aabb.y*_eventmgrscale.y) < pos.y && pos.y < (handle.aabb.by*_eventmgrscale.y)) handle.callback(e);
        console.log((handle.aabb.x*_eventmgrscale.x)+"|"+(handle.aabb.y*_eventmgrscale.y)+"||"+(handle.aabb.bx*_eventmgrscale.x)+"|"+(handle.aabb.by*_eventmgrscale.y));
    }
  }.bind(this);

  var mPointer = function (e,point) {
      SingleView.instance.canvas.style.cursor = (point?"pointer":"auto");
  };

  //constructor:
  SingleView.instance.canvas.addEventListener("click", evCall, false);

  return {
    add: function(aabb,callback) {
      console.log("add");
      handlers.push({aabb,callback});
      sort();
      mouseaabb = aabb;
      mouseaabb.useOffset = true;
      EventMgr.onMouseMove.add(mouseaabb,mPointer);
    },
    remove: function(aabb,callback) {
      //TODO Add error handling.
      handlers.splice(handlers.indexOf({aabb,callback}),1);
      sort();
      mouseaabb = aabb;
      mouseaabb.useOffset = true;
      EventMgr.onMouseMove.remove(mouseaabb,mPointer);
    }
  };
  })(),
  onMouseMove: (function() {
    var handlers = [];
    var sort = function() {
      handlers.sort(function(a,b){return (a.x + a.y)-(b.x + b.y);});
    };
    var evCall = function(e){
      var pos = getCursorPosition(SingleView.instance.canvas,e);
      //console.log("Click: " + pos.x +"|"+pos.y);
      for (var handle of handlers){
        //console.log((handle.aabb.x*_eventmgrscale.x)+"|"+(handle.aabb.y*_eventmgrscale.y)+"||"+(handle.aabb.bx*_eventmgrscale.x)+"|"+(handle.aabb.by*_eventmgrscale.y));
        if((handle.aabb.x*_eventmgrscale.x) < pos.x - (handle.aabb.useOffset?_eventmgrxoffset:0) &&
          pos.x - (handle.aabb.useOffset?_eventmgrxoffset:0) < (handle.aabb.bx*_eventmgrscale.x) &&
          (handle.aabb.y*_eventmgrscale.y) < pos.y && pos.y < (handle.aabb.by*_eventmgrscale.y)){
            handle.callback(e,true);
          }else{
            handle.callback(e,false);
          }
      }
    }.bind(this);
    //constructor:
    SingleView.instance.canvas.addEventListener("mousemove", evCall, false);

    return {
      add: function(aabb,callback) {
        console.log("add mouse move");
        handlers.push({aabb,callback});
        sort();
      },
      remove: function(aabb,callback) {
        //TODO Add error handling.
        handlers.splice(handlers.indexOf({aabb,callback}),1);
        sort();
      },
      setScale: function(scalex, scaley){
        scaleX = scalex;
        scaleY = scaley;
      }};
  })()
};
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
      reject(Error("Network Error src: " + url));
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
  return new Promise(function(resolve, reject){
    var mg = new Image();
    mg.src = url;
    mg.onload = function(){
      resolve(mg);
    }.bind(this);
    mg.onerror = function() {
      reject(Error("Couldn't load: "+url));
    };
  });
}

function createSequence(list,promise) {
  var promises = [];
  list.forEach((item)=>{promises.push(promise(item));console.log(item);});
  return Promise.all(promises);
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

    var callback = function(link){
        var localLink = link;
        return function(e){
        console.log(localLink.link);
        getJson("resources/" + localLink.link).then(this.nextScene);
      }.bind(this);
    }.bind(this);
    if(img)this.images.push(new Img(img,0,0,MAXWIDTH,MAXHEIGHT));

    for (var link of links) {

      var tmp = {aabb:{x:link.x,y:link.y,bx:(link.x+link.w),by:(link.y+link.h)},callback:callback(link)};
      this.clickEv.push(tmp);
      if(link.img)this.images.push(new Img(link.img,link.x,link.y,link.w,link.h));
    }

  }
  init(){
    for (var image of this.images) {
      this.view.add(image);
    }
    resEvent();
  }
  resume(){
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
    for (var ev of this.clickEv) {
      EventMgr.onClick.remove(ev.aabb,ev.callback);
    }
  }
  destruct(){
    for (var image of this.images) {
      //this.view.remove(image);
    }
    SingleView.instance.ctx.resetTransform();
  }
}
class NormalScene extends Scene{
  constructor(img,data){
    super(img,[{x:0,y:0,w:SingleView.instance.canvas.width,h:SingleView.instance.canvas.height,link:data.link}]);
  }
}
class MovingScene extends Scene{
  constructor(img,data){
    super(undefined,data.links);
    var bgImg = new Img(img,0,0,data.width,MAXHEIGHT);
    bgImg.position.x = -data.width/2 + SingleView.instance.canvas.width/(2*SingleView.instance.getScale().x);
    this.images.unshift(bgImg);
    this.xoffset = 0;

    var moveCB = function(parallax,direction){
      //TODO Validate arguments!
      var lParallax = parallax;
      var lDirection = direction;
      return function(e,mouseOver){
          parallax.direction[direction] = mouseOver;
      }.bind(this);
    }.bind(this);
    let aabbL = {x:0,y:0,bx:SingleView.instance.canvas.width/3,by:SingleView.instance.canvas.height};
    var aabbR = {x:(SingleView.instance.canvas.width-(SingleView.instance.canvas.width/3)),
      y:0,bx:SingleView.instance.canvas.width+SingleView.instance.canvas.width/3,by:SingleView.instance.canvas.height};

    this.parallax = {bg:bgImg,img:new Img(data.parallax,data.px,data.py,data.pw,data.ph),pscale:data.pscale,callback: moveCB,fields:{aabbL,aabbR},direction:[false,false]};
  }
  resume(){
    super.resume();
    EventMgr.onMouseMove.add(this.parallax.fields.aabbL,this.parallax.callback(this.parallax,0));
    EventMgr.onMouseMove.add(this.parallax.fields.aabbR,this.parallax.callback(this.parallax,1));
    EventMgr.offset(this.xoffset);
  }
  update(){
    let x = this.xoffset;
    let ctx = SingleView.instance.ctx;
    let scale = SingleView.instance.getScale();
    let llim = ctx.canvas.width/(2*scale.x), rlim = -(ctx.canvas.width/(2*scale.x));
    //console.log(llim +"|"+ rlim);
    if (this.parallax.direction[0]&&!this.parallax.direction[1]&& this.xoffset != llim) {
      this.xoffset += 18;
      if(this.xoffset > llim) this.xoffset = llim;
      x = this.xoffset;
    } else if(!this.parallax.direction[0]&&this.parallax.direction[1]&& this.xoffset != rlim){
      this.xoffset += -18;
      if(this.xoffset < rlim) this.xoffset = rlim;
      x = this.xoffset;
    }
    EventMgr.offset(this.xoffset);
    EventMgr.setScale(scale.x,scale.y);
    ctx.setTransform(scale.x,0,0,scale.y,x*scale.x,0);
    super.update();
    ctx.setTransform(scale.x,0,0,scale.y,x*this.parallax.pscale*scale.x,0);
    this.parallax.img.draw(ctx.canvas,ctx);
  }
  pause(){
    super.pause();
    EventMgr.onMouseMove.remove(this.parallax.fields.aabbL,this.parallax.callback(this.parallax,0));
    EventMgr.onMouseMove.remove(this.parallax.fields.aabbR,this.parallax.callback(this.parallax,1));
    EventMgr.offset(0);
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
          console.log("here: "+sceneF.link);
          this.scene = new NormalScene(ret,sceneF);
          console.log("onload: " + this.scene.test);
          resolve(this.scene);
        });
        break;
      case "moving":
        var moving = true;
        var parallax = new Image();
        parallax.src = "resources/" + sceneF.parallax;
        sceneF.parallax = parallax;
        /* falls through */
      case "interactive":
        var img = new Image();
        img.src = "resources/" + sceneF.img;
        var sources = [];
        sceneF.links.forEach((link)=>{sources.push("resources/" +link.img);});
        console.log(sources);
        createSequence(sources,(link)=>{return getImage(link);}).then((results)=>{
          for (var i = 0; i < results.length; i++) {
            console.log(results[i].src +"|"+ i);
            sceneF.links[i].img = results[i];
          }
          resolve(moving?new MovingScene(img,sceneF):new Scene(img,sceneF.links));
        });
        break;
      default:
        //TODO Add error handling for unknown type.
        throw Error("Invalide type: "+sceneF.type);
    }

    // if (true) {
    //   resolve();
    // } else {
    //   reject(Error("Temp Error msg"));
    // }
  });
}
// Source: scripts/x_game.js



var v = SingleView.instance;

function resEvent(){
  v.resize();
}

['resize'].forEach(function(e){
  window.addEventListener(e, resEvent, false);
});

resEvent();

getJson("resources/scene1.json").then(function(cont) {
  loadScene(cont).then(function(testScene){
  stateman.destruct();
  SingleView.instance.deleteAll();
  stateman.push(testScene);
});});
