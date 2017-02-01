//esversion: 6

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
