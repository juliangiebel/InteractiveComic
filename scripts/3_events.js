/*jshint esversion: 6 */


var EventMgr = {
  onClick: (function(){
  var sort = function() {
    // [].sort(function(a,b){return (a.x + a.y)-(b.x + b.y);});
    //TODO Implement
  };
  return {
    add: function(aabb,callback) {
      //TODO Implement adding event handler
      sort();
    },
    remove: function(callback) {
      //TODO Implement removing event handlers
      sort();
    }
  };
})()};
