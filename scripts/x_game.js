/*jshint esversion: 6 */

//stateman.push(new Scene());


//Testcode:
var v = SingleView.instance;

function resEvent(){
  v.resize();
}

['resize'].forEach(function(e){
  window.addEventListener(e, resEvent, false);
});

resEvent();
var image = new Image();
image.src = "img/sunrise-1756274_640.jpg";
var background = new Img(image,0,0);
v.add(background);
v.draw();
//----------------------------------------------
