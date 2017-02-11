/*jshint esversion: 6 */



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
