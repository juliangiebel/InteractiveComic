/*jshint esversion: 6 */

//Globals:
const DEBUG = true;
//--------------

var stateStack = [];
var stateman = {
  init: function(){

  },
  update: function(){
    if(stateStack.length <= 0) return;
    stateStack[stateStack.length -1].update();
  },
  push: function(state){
    if(state.update === undefined){
      throw new TypeError("State doesn't contain an update function");
    }
    if(stateStack.length > 0) stateStack[stateStack.length -1].pause();

    stateStack.push(state);
    state.init();
    state.resume();
  },
  pop: function(){
    if(stateStack.length <= 0) return;
    var lState = stateStack.pop();
    lState.pause();
    lState.destruct();
    if(stateStack.length > 0) stateStack[stateStack.length -1].resume();

    return lState;
  },
  swap: function(state){
    var tmp = this.pop();
    try {
      this.push(state);
    }catch (e) {
      this.push(tmp);
      throw Error("Error during state swap: "+e.message);
    }
  },
  destruct: function(){
    stateStack.forEach(function(e){e.pause();e.destruct();});
    stateStack = [];
  }
};

var upInterval = setInterval(stateman.update,30);
