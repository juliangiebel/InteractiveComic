/*jshint esversion: 6 */
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return {x,y};
}
var _eventmgrscale = {x:1,y:1};
var _eventmgrxoffset = 0;
var EventMgr = {
  setScale: function(scalex, scaley){
    _eventmgrscale.x = scalex;
    _eventmgrscale.y = scaley;
  },
  offset: function (x) {
    _eventmgrxoffset = x;
  },
  onClick: (function(){
  var handlers = [];
  var sort = function() {
    handlers.sort(function(a,b){return (a.x + a.y)-(b.x + b.y);});
  };
  var evCall = function(e){
    var pos = getCursorPosition(SingleView.instance.canvas,e);
    console.log("Click: " + pos.x +"|"+pos.y+"|"+handlers.length+"|"+(pos.x+_eventmgrxoffset));
    for (var handle of handlers){
      if((handle.aabb.x*_eventmgrscale.x) < (pos.x-_eventmgrxoffset) && (pos.x-_eventmgrxoffset) < (handle.aabb.bx*_eventmgrscale.x) &&
        (handle.aabb.y*_eventmgrscale.y) < pos.y && pos.y < (handle.aabb.by*_eventmgrscale.y)) handle.callback(e);
        console.log((handle.aabb.x*_eventmgrscale.x)+"|"+(handle.aabb.y*_eventmgrscale.y)+"||"+(handle.aabb.bx*_eventmgrscale.x)+"|"+(handle.aabb.by*_eventmgrscale.y));
    }
  }.bind(this);

  var mPointer = function (e,point) {
      SingleView.instance.canvas.style.cursor = (point?"pointer":"auto");
  };

  //constructor:
  SingleView.instance.canvas.addEventListener("click", evCall, false);

  return {
    add: function(aabb,callback) {
      console.log("add");
      handlers.push({aabb,callback});
      sort();
      mouseaabb = aabb;
      mouseaabb.useOffset = true;
      EventMgr.onMouseMove.add(mouseaabb,mPointer);
    },
    remove: function(aabb,callback) {
      //TODO Add error handling.
      handlers.splice(handlers.indexOf({aabb,callback}),1);
      sort();
      mouseaabb = aabb;
      mouseaabb.useOffset = true;
      EventMgr.onMouseMove.remove(mouseaabb,mPointer);
    }
  };
  })(),
  onMouseMove: (function() {
    var handlers = [];
    var sort = function() {
      handlers.sort(function(a,b){return (a.x + a.y)-(b.x + b.y);});
    };
    var evCall = function(e){
      var pos = getCursorPosition(SingleView.instance.canvas,e);
      //console.log("Click: " + pos.x +"|"+pos.y);
      for (var handle of handlers){
        //console.log((handle.aabb.x*_eventmgrscale.x)+"|"+(handle.aabb.y*_eventmgrscale.y)+"||"+(handle.aabb.bx*_eventmgrscale.x)+"|"+(handle.aabb.by*_eventmgrscale.y));
        if((handle.aabb.x*_eventmgrscale.x) < pos.x - (handle.aabb.useOffset?_eventmgrxoffset:0) &&
          pos.x - (handle.aabb.useOffset?_eventmgrxoffset:0) < (handle.aabb.bx*_eventmgrscale.x) &&
          (handle.aabb.y*_eventmgrscale.y) < pos.y && pos.y < (handle.aabb.by*_eventmgrscale.y)){
            handle.callback(e,true);
          }else{
            handle.callback(e,false);
          }
      }
    }.bind(this);
    //constructor:
    SingleView.instance.canvas.addEventListener("mousemove", evCall, false);

    return {
      add: function(aabb,callback) {
        console.log("add mouse move");
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
