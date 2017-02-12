/*jshint esversion: 6 */
class Scene{
  constructor(img,links){
    this.test = "scene";
    this.view = SingleView.instance;
    this.images = [];
    this.clickEv = [];

    var callback = function(e){
      getJson("resources/" + link).then(this.nextScene);
    };

    this.images.push(new Img(img,0,0));

    for (var link of links) {
      var tmp = {aabb:{x:link.x,y:link.y,bx:(link.x+link.w),by:(link.y+link.h)},callback:callback.bind(this,link)};
      this.clickEv.push(tmp);
      if(link.img)this.images.push(new Img(link.img,link.x,link.y,link.w,link.h));
    }

  }
  init(){
    this.onClick = function(){
      // stateman.pop();
    }.bind(this);

    for (var image of this.images) {
      this.view.add(image);
    }
  }
  resume(){
    this.view.canvas.addEventListener("click", this.onClick, false);

    for (var ev of this.clickEv) {
      EventMgr.onClick.add(ev.aabb,ev.callback);
    }
  }
  update(){
    this.view.draw();
  }
  nextScene(sceneF){
    loadScene(sceneF).then(function(scene) {
      stateman.swap(scene);
    });
  }
  pause(){
    this.view.canvas.removeEventListener("click", this.onClick);
    for (var ev of clickEv) {
      EventMgr.onClick.remove(ev.aabb,ev.callback);
    }
  }
  destruct(){
    for (var image of this.images) {
      //this.view.remove(image);
    }
  }
}
class NormalScene extends Scene{
  constructor(img,data){
    super(img,[{x:0,y:0,bx:SingleView.instance.canvas.width,by:SingleView.instance.canvas.height,link:data.link}]);
  }
}
/**Loads a scene from a json object.
 * @param {object} sceneF the json object containing informationa about a scene.
 * @returns {Promise} A promise returning a {@link Scene} object.
 */
function loadScene(sceneF){
  return new Promise(function(resolve, reject){

    console.log(sceneF.img);

    switch (sceneF.type) {
      case "normal":
        console.log("normal");
        getImage("resources/" + sceneF.img).then(function(ret){
          console.log(ret);
          this.scene = new NormalScene(ret,sceneF.link);
          console.log("onload: " + this.scene.test);
          resolve(this.scene);
        });
        break;
      case "interactive":
        //TODO Imlementing interactive scenes.
        scene = new Scene(img,sceneF.links);
        //Load all images in 'links'...
        break;
      case "moving":
        //TODO Implement moving scenes.
        break;
        //NOTE Animiated scenens?
      default:
        //TODO Add error handling for unknown type.
    }

    // if (true) {
    //   resolve();
    // } else {
    //   reject(Error("Temp Error msg"));
    // }
  });
}
// //Testcode:
// get("tesss.json").then(function(cont){
//   //will never run, there is no file called tesss.json
//   console.log(cont);
// });
//
// getJson("test.json").then(function(cont){
//   console.log("succes!\n" + cont.test);
// });
//
// //---------------------
