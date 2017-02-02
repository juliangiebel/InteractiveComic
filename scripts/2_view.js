/*jshint esversion: 6 */

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
