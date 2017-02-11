/*jshint esversion: 6 */
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return {x,y};
}

var EventMgr = {
  onClick: (function(){
  var handlers = [];
  var scaleModyfier = 1;
  var sort = function() {
    handlers.sort(function(a,b){return (a.x + a.y)-(b.x + b.y);});
  };
  var evCall = function(e){
    var pos = getCursorPosition(SingleView.instance.canvas,e);
    console.log("Click: " + pos.x +"|"+pos.y);
    for (var handle of handlers){
      if(scale(handle.aabb.x) < pos.x && pos.x < scale(handle.aabb.bx) && scale(handle.aabb.y) < pos.y && pos.y < scale(handle.aabb.by)) handle.callback(e);
    }
  }.bind(this);
  var scale = function(number) {
    return number*scaleModyfier;
  };
  //constructor:
  SingleView.instance.canvas.addEventListener("click", evCall, false);

  return {
    add: function(aabb,callback) {
      handlers.push({aabb,callback});
      sort();
    },
    remove: function(aabb,callback) {
      //TODO Add error handling.
      handlers.splice(handlers.indexOf({aabb,callback}),1);
      sort();
    },
    setScale: function(scale){
      scale = scale;
    }
  };
})()};
// //Testcode:
// var testcb = function() {
//   console.log("Click: invisible box");
//   EventMgr.onClick.remove({x:20,y:20,bx:60,by:60},testcb);
// }.bind(this,testcb);
// EventMgr.onClick.add({x:20,y:20,bx:60,by:60},testcb);
// //--------------
