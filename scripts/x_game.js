/*jshint esversion: 6 */


var v = SingleView.instance;

function resEvent(){
  v.resize();
}

['resize'].forEach(function(e){
  window.addEventListener(e, resEvent, false);
});

resEvent();

getJson("resources/scene1.json").then(function(cont) {
  loadScene(cont).then(function(testScene){
  stateman.destruct();
  SingleView.instance.deleteAll();
  stateman.push(testScene);
});});
