/*jshint esversion: 6 */
//Abstract
class GElement {
  constructor(_x,_y){
    if (new.target === GElement) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }

    this.hidden = false;
    this.position = {x:_x,y:_y};
  }

}

class Img extends GElement{
  constructor(image,x,y,width,height,cx,cy,cWidth,cHeight){
    super(x,y);
    this.image = image;
    this.width = width;
    this.height = height;
    this.cx = cx;
    this.cy = cy;
    this.cWidth = cWidth;
    this.xHeight = cHeight;
  }

  draw(canvas,ctx){
    ctx.drawImage(this.image,this.position.x,this.position.y,this.width||canvas.width,this.height||canvas.height);
  }

}

class Rect extends GElement{
  constructor(x,y,w,h,fill){
    super(x,y);
    this.w = w;
    this.h = h;
    this.fill = fill||false;
  }
  draw(canvas,ctx){
    if(this.fill){
      ctx.fillRect(this.position.x,this.position.y,this.w,this.h);
    }else{
      ctx.strokeRect(this.position.x,this.position.y,this.w,this.h);
    }
  }
}
