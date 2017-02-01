


var stateStack = [];
var stateman = {
  init: function(){

  },
  update: function(){
    if(stateStack.length <= 0) return;
    (stateStack[stateStack.length -1]).update();
  },
  push: function(state){
    if(state.update === undefined){
      throw new TypeError("State doesn't contain update function");
    }
    stateStack.push(state);
    (stateStack[stateStack.length -1]).init();
  },
  pop: function(){
    if(stateStack.length <= 0) return;
    (stateStack[stateStack.length -1]).destruct();
    return stateStack.pop();
  },
  destruct: function(){
    stateStack.forEach(function(e){e.destruct();});
    stateStack = [];
  }
};

var upInterval = setInterval(stateman.update,20);

//Absolutely don't need this *lol*
class  State{
  constructor() {
    if (new.target === State) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    if (this.init === undefined) {
      throw new TypeError("Must override init");
    }
    if (this.update === undefined) {
      throw new TypeError("Must override upate");
    }
    if (this.destruct === undefined) {
      throw new TypeError("Must override destruct");
    }
  }
}
;//esversion: 6

const MAXWIDTH = 1620;
const MAXHEIGHT = 960;

var c = document.querySelector("#c");
var ctx = c.getContext("2d");

var image = new Image(1200,700);

function resize() {
  c.width  = Math.min(window.innerWidth,MAXWIDTH);
  c.height = Math.min(window.innerHeight, MAXHEIGHT);
  var styletext = "translate(" +((window.innerWidth - c.width)/2) +"px, " +((window.innerHeight - c.height)/2) +"px)";
  document.getElementById("c").style.transform = styletext;
}

c.onload   = resize();
window.addEventListener("resize", resize, false);

image.onload = function() {
  ctx.drawImage(image,0,0,c.width,c.height);
  console.log("Loaded image");
};

image.src = "img/sunrise-1756274_640.jpg";
