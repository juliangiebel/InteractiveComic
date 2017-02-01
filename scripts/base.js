


var stateStack = [];
var stateman = {
  init: function(){

  },
  update: function(){
    if(stateStack.length <= 0) return;
    (stateStack[stateStack.length -1]).update();
  },
  push: function(state){
    if(state.update === undefined){
      throw new TypeError("State doesn't contain update function");
    }
    stateStack.push(state);
    (stateStack[stateStack.length -1]).init();
  },
  pop: function(){
    if(stateStack.length <= 0) return;
    (stateStack[stateStack.length -1]).destruct();
    return stateStack.pop();
  },
  destruct: function(){
    stateStack.forEach(function(e){e.destruct();});
    stateStack = [];
  }
};

var upInterval = setInterval(stateman.update,20);

//Absolutely don't need this *lol*
class  State{
  constructor() {
    if (new.target === State) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    if (this.init === undefined) {
      throw new TypeError("Must override init");
    }
    if (this.update === undefined) {
      throw new TypeError("Must override upate");
    }
    if (this.destruct === undefined) {
      throw new TypeError("Must override destruct");
    }
  }
}
