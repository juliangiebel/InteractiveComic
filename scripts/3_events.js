/*jshint esversion: 6 */
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return {x,y};
}
var _eventmgrscale = {x:1,y:1};
var EventMgr = {
  setScale: function(scalex, scaley){
    _eventmgrscale.x = scalex;
    _eventmgrscale.y = scaley;
  },
  onClick: (function(){
  var handlers = [];
  var sort = function() {
    handlers.sort(function(a,b){return (a.x + a.y)-(b.x + b.y);});
  };
  var evCall = function(e){
    var pos = getCursorPosition(SingleView.instance.canvas,e);
    console.log("Click: " + pos.x +"|"+pos.y);
    for (var handle of handlers){
      if((handle.aabb.x*_eventmgrscale.x) < pos.x && pos.x < (handle.aabb.bx*_eventmgrscale.x) &&
        (handle.aabb.y*_eventmgrscale.y) < pos.y && pos.y < (handle.aabb.by*_eventmgrscale.y)) handle.callback(e);
    }
  }.bind(this);
  //constructor:
  SingleView.instance.canvas.addEventListener("click", evCall, false);

  return {
    add: function(aabb,callback) {
      console.log("add");
      handlers.push({aabb,callback});
      sort();
    },
    remove: function(aabb,callback) {
      //TODO Add error handling.
      handlers.splice(handlers.indexOf({aabb,callback}),1);
      sort();
    }
  };
  })(),
  onMouseMove: (function() {
    var handlers = [];
    var scaleX = 1;
    var scaleY = 1;
    var sort = function() {
      handlers.sort(function(a,b){return (a.x + a.y)-(b.x + b.y);});
    };
    var evCall = function(e){
      var pos = getCursorPosition(SingleView.instance.canvas,e);
      //console.log("Click: " + pos.x +"|"+pos.y);
      for (var handle of handlers){
        if((handle.aabb.x*_eventmgrscale.x) < pos.x && pos.x < (handle.aabb.bx*_eventmgrscale.x) &&
          (handle.aabb.y*_eventmgrscale.y) < pos.y && pos.y < (handle.aabb.by*_eventmgrscale.y)) handle.callback(e);
      }
    }.bind(this);
    //constructor:
    SingleView.instance.canvas.addEventListener("mousemove", evCall, false);

    return {
      add: function(aabb,callback) {
        console.log("add");
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
