/*jshint esversion: 6 */
class Scene{
  constructor(img,links){
    this.test = "scene";
    this.view = SingleView.instance;
    this.images = [];
    this.clickEv = [];

    var callback = function(link){
        var localLink = link;
        return function(e){
        console.log(localLink.link);
        getJson("resources/" + localLink.link).then(this.nextScene);
      }.bind(this);
    }.bind(this);
    if(img)this.images.push(new Img(img,0,0,MAXWIDTH,MAXHEIGHT));

    for (var link of links) {

      var tmp = {aabb:{x:link.x,y:link.y,bx:(link.x+link.w),by:(link.y+link.h)},callback:callback(link)};
      this.clickEv.push(tmp);
      if(link.img)this.images.push(new Img(link.img,link.x,link.y,link.w,link.h));
    }

  }
  init(){
    for (var image of this.images) {
      this.view.add(image);
    }
  }
  resume(){
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
    for (var ev of this.clickEv) {
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
    super(img,[{x:0,y:0,w:SingleView.instance.canvas.width,h:SingleView.instance.canvas.height,link:data.link}]);
  }
}
class MovingScene extends Scene{
  constructor(img,data){
    super(undefined,data.links);
    var bgImg = new Img(img,0,0,data.width,MAXHEIGHT);
    bgImg.position.x = -data.width/2 + SingleView.instance.canvas.width/(2*SingleView.instance.getScale().x);
    this.images.unshift(bgImg);
    this.xoffset = 0;

    var moveCB = function(parallax,direction){
      //TODO Validate arguments!
      var lParallax = parallax;
      var lDirection = direction;
      return function(e,mouseOver){
          parallax.direction[direction] = mouseOver;
      }.bind(this);
    }.bind(this);
    let aabbL = {x:0,y:0,bx:SingleView.instance.canvas.width/3,by:SingleView.instance.canvas.height};
    var aabbR = {x:(SingleView.instance.canvas.width-(SingleView.instance.canvas.width/3)),
      y:0,bx:SingleView.instance.canvas.width+SingleView.instance.canvas.width/3,by:SingleView.instance.canvas.height};

    this.parallax = {bg:bgImg,img:new Img(data.parallax,data.px,data.py,data.pw,data.ph),pscale:data.pscale,callback: moveCB,fields:{aabbL,aabbR},direction:[false,false]};
  }
  resume(){
    super.resume();
    EventMgr.onMouseMove.add(this.parallax.fields.aabbL,this.parallax.callback(this.parallax,0));
    EventMgr.onMouseMove.add(this.parallax.fields.aabbR,this.parallax.callback(this.parallax,1));
  }
  update(){
    let x = this.xoffset;
    let ctx = SingleView.instance.ctx;
    let scale = SingleView.instance.getScale();
    let llim = ctx.canvas.width/(2*scale.x), rlim = -(ctx.canvas.width/(2*scale.x));
    //console.log(llim +"|"+ rlim);
    if (this.parallax.direction[0]&&!this.parallax.direction[1]&& this.xoffset != llim) {
      this.xoffset += 18;
      if(this.xoffset > llim) this.xoffset = llim;
      x = this.xoffset;
    } else if(!this.parallax.direction[0]&&this.parallax.direction[1]&& this.xoffset != rlim){
      this.xoffset += -18;
      if(this.xoffset < rlim) this.xoffset = rlim;
      x = this.xoffset;
    }

    ctx.setTransform(scale.x,0,0,scale.y,x*scale.x,0);
    super.update();
    ctx.setTransform(scale.x,0,0,scale.y,x*this.parallax.pscale*scale.x,0);
    this.parallax.img.draw(ctx.canvas,ctx);
  }
  pause(){
    super.pause();
    EventMgr.onMouseMove.remove(this.parallax.fields.aabbL,this.parallax.callback(this.parallax,0));
    EventMgr.onMouseMove.remove(this.parallax.fields.aabbR,this.parallax.callback(this.parallax,1));
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
          console.log("here: "+sceneF.link);
          this.scene = new NormalScene(ret,sceneF);
          console.log("onload: " + this.scene.test);
          resolve(this.scene);
        });
        break;
      case "moving":
        var moving = true;
        var parallax = new Image();
        parallax.src = "resources/" + sceneF.parallax;
        sceneF.parallax = parallax;
        /* falls through */
      case "interactive":
        var img = new Image();
        img.src = "resources/" + sceneF.img;
        var sources = [];
        sceneF.links.forEach((link)=>{sources.push("resources/" +link.img);});
        console.log(sources);
        createSequence(sources,(link)=>{return getImage(link);}).then((results)=>{
          for (var i = 0; i < results.length; i++) {
            console.log(results[i].src +"|"+ i);
            sceneF.links[i].img = results[i];
          }
          resolve(moving?new MovingScene(img,sceneF):new Scene(img,sceneF.links));
        });
        break;
      default:
        //TODO Add error handling for unknown type.
        throw Error("Invalide type: "+sceneF.type);
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
