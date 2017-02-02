/*jshint esversion: 6 */
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
