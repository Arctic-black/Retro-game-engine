const collide = {
  rectToRect: function(box1, box2){
    if(box1.x + box1.w > box2.x && box1.x < box2.x + box2.w) {
      if(box1.y + box1.h > box2.y && box1.y < box2.y + box2.h) {
        return true;
      } else {
        return false;
      }
    }
  }
};