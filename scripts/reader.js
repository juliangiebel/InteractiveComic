var c = document.querySelector("#c");
var ctx = c.getContext("2d");

var image = new Image();

image.onload = function() {
  console.log("Loaded image");
  ctx.drawImage(image, 0,0, c.width, c.height);
};

image.src = "img/bg-pattern2-perf.png";
