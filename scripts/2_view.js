/*jshint esversion: 6 */

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
