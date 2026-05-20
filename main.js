const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  WIDTH = canvas.width = window.innerWidth;
  HEIGHT = canvas.height = window.innerHeight;
});

// ----- Loading system ----- \\

const loadPix = {
  curLoad: 0,
  stepIndex: 0,
  stepMax: 4000,
  tempCanvas: null,
  tempCtx: null,
  pixelFrame: null,
  isLoading: false,
  
  // Start loading a specific frame
  initiate: function (path) {
    this.isLoading = true;
    this.curLoad = 0; // reset row counter
    this.stepIndex = 0;
    
    this.path = path;
    
    // Get the actual frame object
    this.pixelFrame = this.getFrame(path);
    this.pixSize = this.pixelFrame.pixSize || 2;
    
    if (
      !this.pixelFrame ||
      !this.pixelFrame.map ||
      this.pixelFrame.map.length === 0
    ) {
      console.error('Invalid pixel frame for path:', path);
      this.isLoading = false;
      return;
    }
    
    const height = this.pixelFrame.map.length * this.pixSize;
    const width = this.pixelFrame.map[0].length * this.pixSize;
    
    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
    this.tempCtx = this.tempCanvas.getContext('2d');
  },
  
  getFrame: function (path) {
    // path example: ['sprites', 'player', 'body', 0]
    let obj = pixelart;
    for (let key of path) {
      obj = obj[key];
      if (obj === undefined) return null;
    }
    return obj; // should be the {palette, map} object
  },
  
  set: function (path, value) {
    let obj = pixelart;
    for (let key of path.slice(0, -1)) {
      obj = obj[key];
      if (obj === undefined) return false;
    }
    obj[path[path.length - 1]] = value;
    return true;
  },
  
  render: function () {
    //if (!this.pixelFrame || !this.tempCtx) return;
    const pixSize = this.pixSize;
    const map = this.pixelFrame.map;
    if (this.curLoad >= map.length) return;
    
    this.rowlen = map[this.curLoad].length;
    const step = Math.floor(this.stepMax / this.rowlen);
    
    const startRow = this.curLoad;
    let endRow = startRow + step;
    
    if (endRow > map.length) endRow = map.length;
    
    const palette = this.pixelFrame.palette;
    
    for (let i = startRow; i < endRow; i++) {
      const row = map[i];
      for (let j = 0; j < row.length; j++) {
        const char = row[j];
        if (char === '-') {
          this.tempCtx.fillStyle = 'transparent';
        } else {
          this.tempCtx.fillStyle = palette[char] || '#000000';
        }
        this.tempCtx.fillRect(j * pixSize, i * pixSize, pixSize, pixSize);
      }
    }
    
    // Update current row position
    this.curLoad = endRow;
    
    if (this.curLoad >= map.length) {
      this.stepIndex = 0;
      const path = this.path;
      this.set(path, this.tempCanvas);
    }
  },
  
  renderLoop: function () {
    return this.curLoad < this.pixelFrame.map.length;
  },
  
  getImage: function () {
    return this.tempCanvas;
  },
};

//====== Loading queue ======
let toLoad = [
  ['sprites', 'player', 'idle_south', 0],
  ['sprites', 'player', 'idle_north', 0],
  ['sprites', 'player', 'idle_east', 0],
  ['sprites', 'player', 'idle_west', 0],
  ['sprites', 'player', 'idle_southwest', 0],
  ['sprites', 'player', 'idle_southeast', 0],
  ['sprites', 'player', 'idle_northwest', 0],
  ['sprites', 'player', 'idle_northeast', 0],
  
  ['tiles', 'floor_wood', 0],
  ['tiles', 'grass', 0],
  ['tiles', 'portal', 0],
];

let loadIndex = 0;

//====== Main loop ======
function loading() {
  if (loadIndex >= toLoad.length) return;
  
  const currentPath = toLoad[loadIndex];
  
  if (!loadPix.isLoading) {
    loadPix.initiate(currentPath);
  }
  
  if (loadPix.renderLoop()) {
    loadPix.render();
    ctx.drawImage(loadPix.getImage(), 0, 0);
  } else {
    // finished current asset
    loadIndex++; // move to next asset
    loadPix.isLoading = false; // ready for next initiate
    
    if(loadIndex >= toLoad.length) {
      app.scene = 'game'; // switch to game scene
      toLoad = []; // clear loading queue
    }
  }
}

class World {
  constructor(config){
    this.map = config.data.map;
    this.room = config.room;
    this.tileSet = config.data.tileSet;
    this.portals = config.data.portals;
    this.width = this.map[0].length * 64;
    this.height = this.map.length * 64;

    this.camdata = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      lookahead: 46,
      lerpSpeed: 0.2
    };
  }

  camera() {
    let player = app.player.hitbox;
    this.width = this.map[0].length * 64;
    this.height = this.map.length * 64;

    let dx = 0,
      dy = 0;
    if (player.direction === 'east') dx = this.camdata.lookahead;
    if (player.direction === 'west') dx = -this.camdata.lookahead;
    if (player.direction === 'south') dy = this.camdata.lookahead;
    if (player.direction === 'north') dy = -this.camdata.lookahead;
    
    let camTargetX = player.x - canvas.width / 2 + dx;
    let camTargetY = player.y - canvas.height / 2 + dy;
    
    this.camdata.x += (camTargetX - this.camdata.x) * this.camdata.lerpSpeed;
    this.camdata.y += (camTargetY - this.camdata.y) * this.camdata.lerpSpeed;

    this.camdata.x = Math.max(-64, Math.min(this.camdata.x, this.width - canvas.width));
    this.camdata.y = Math.max(-64, Math.min(this.camdata.y, this.height - canvas.height));
    
    ctx.setTransform(1, 0, 0, 1, -this.camdata.x, -this.camdata.y);

  }
  
  loadMap(toMap, atTile, dir) {
    this.mapdata = mapdata['map']['room'][toMap];
    this.tileSet = this.mapdata.tileSet;
    this.map = this.mapdata.map;
    this.portals = this.mapdata.portals;

    let w = this.map[0].length;
    let h = this.map.length;

    for(let i = 0; i < h; i++){
      for(let j = 0; j < w; j++){
        if (this.map[i][j] === atTile) {
          const player = app.player.hitbox;
          if (dir === 'north') {
            player.x = j*64;
            player.y = i*64 + 64;
          } else if (dir === 'south') {
            player.x = j*64;
            player.y = i*64 - 46;
          } else if (dir === 'east') {
            player.x = j*64 + 64;
            player.y = i*64;
          } else if (dir === 'west') {
            player.x = j*64 - 64;
            player.y = i*64;
          }
          ctx.drawImage(this.getTile(this.tileSet[this.portals[this.map[i][j]].tile]), j*64, i*64);
        } else {
          ctx.drawImage(this.getTile(this.tileSet[this.map[i][j]]), j*64, i*64);
        }
      }
    }
  }
  
  getTile(path) {
    let obj = pixelart;
    for (let key of path) {
      obj = obj[key];
      if (obj === undefined) return null;
    }
    return obj;
  }
  
  checkPortals(x, y, portaldata, char) {
    const H_box = app.player.hitbox;
    const tile = {
      x: x,
      y: y,
      w: 64,
      h: 64
    };
    
    if(collide.rectToRect(H_box, tile)) {
      console.log('map' + portaldata.dest + ' at tile ' + char + ' in direction ' + portaldata.direction);
      this.loadMap(portaldata.dest, char, portaldata.direction);
      app.transitionData.active = true;
      return true;
    }
  }
  
  drawMap(){
    let w = this.map[0].length;
    let h = this.map.length;
    for(let i = 0; i < h; i++){
      for(let j = 0; j < w; j++){
        if (this.portals[this.map[i][j]]) {
          if (this.checkPortals(j*64, i*64, this.portals[this.map[i][j]], this.map[i][j])) {
            break;
            //return; // Exit early if a portal was triggered to avoid drawing the old map
          }
          ctx.drawImage(this.getTile(this.tileSet[this.portals[this.map[i][j]].tile]), j*64, i*64);
        } else {
          ctx.drawImage(this.getTile(this.tileSet[this.map[i][j]]), j*64, i*64);
        }
      }
    }
  }
  
  run(){
    this.drawMap();
  }
}

class Player {
  constructor(config){
    this.x = config.x;
    this.y = config.y;
    this.hitbox = {x: this.x, y: this.y, w: 86, h: 46};
    this.vx = 0;
    this.vy = 0;
    this.speed = 6;
    
    this.image = ['sprites','player','idle_south',0];
    this.direction = 'south';
  }
  
  update(){
    // Lock input during fade-out only
    if (
      app.transition &&
      app.transition.active &&
      app.transition.phase === 'fadeOut'
    )
    return;
    
    this.vx = this.vy = 0;
    let speed = this.speed;
    
    const north = !!keys['ArrowUp'] || !!keys['w'];
    const south = !!keys['ArrowDown'] || !!keys['s'];
    const west = !!keys['ArrowLeft'] || !!keys['a'];
    const east = !!keys['ArrowRight'] || !!keys['d'];
    
    if (north && !this._prevNorth) {
      if (south) {
        this.vertFirst = 'south';
        this.vertSecond = 'north';
      } else {
        this.vertFirst = this.vertSecond = null;
      }
    }
    if (south && !this._prevSouth) {
      if (north) {
        this.vertFirst = 'north';
        this.vertSecond = 'south';
      } else {
        this.vertFirst = this.vertSecond = null;
      }
    }
    if (!(north && south)) {
      this.vertFirst = this.vertSecond = null;
    }
    
    if (west && !this._prevWest) {
      if (east) {
        this.horzFirst = 'east';
        this.horzSecond = 'west';
      } else {
        this.horzFirst = this.horzSecond = null;
      }
    }
    if (east && !this._prevEast) {
      if (west) {
        this.horzFirst = 'west';
        this.horzSecond = 'east';
      } else {
        this.horzFirst = this.horzSecond = null;
      }
    }
    if (!(west && east)) {
      this.horzFirst = this.horzSecond = null;
    }
    
    let horz = 0,
    vert = 0;
    const isVertOpposing = north && south;
    const isHorzOpposing = west && east;
    
    if (isVertOpposing) {
      vert = this.vertSecond === 'north' ? -1 : 1;
      speed *= 0.8;
    } else {
      if (north) vert -= 1;
      if (south) vert += 1;
    }
    if (isHorzOpposing) {
      horz = this.horzSecond === 'west' ? -1 : 1;
      speed *= 0.8;
    } else {
      if (west) horz -= 1;
      if (east) horz += 1;
    }
    
    if (horz !== 0 || vert !== 0) {
      const len = Math.hypot(horz, vert);
      this.vx = (horz / len) * speed;
      this.vy = (vert / len) * speed;
      const isPureOpposingVert = isVertOpposing && horz === 0;
      const isPureOpposingHorz = isHorzOpposing && vert === 0;
      if (isPureOpposingVert) {
        this.direction = this.vertFirst;
        this.primarydirection = this.vertSecond;
      } else if (isPureOpposingHorz) {
        this.direction = this.horzFirst;
        this.primarydirection = this.horzSecond;
      } else if (horz === 0 || vert === 0) {
        this.direction =
        vert < 0 ? 'north' : vert > 0 ? 'south' : horz < 0 ? 'west' : 'east';
        this.primarydirection = this.direction;
      }
      if (horz !== 0 && vert !== 0) {
        if (north) this.direction = 'north';
        else if (south) this.direction = 'south';
        if (west) this.direction += 'west';
        else if (east) this.direction += 'east';
      }
    }
    
    //const r = this.size / 2;
    //const moved = moveAndSlide(this.x, this.y, r, this.vx, this.vy);
    this.hitbox.x += this.vx;
    this.hitbox.y += this.vy;

    //constrain player to map bounds
    this.hitbox.x = Math.max(0, Math.min(this.hitbox.x, app.map.width - this.hitbox.w));
    this.hitbox.y = Math.max(0, Math.min(this.hitbox.y, app.map.height - this.hitbox.h));
    this.adjsutToHitbox();
    
    this._prevNorth = north;
    this._prevSouth = south;
    this._prevWest = west;
    this._prevEast = east;
  }
  adjsutToHitbox() {
    if (this.direction === 'north' || this.direction === 'south') {
      this.x = this.hitbox.x - 16;  
      this.y = this.hitbox.y;
    }
    if (this.direction === 'east' || this.direction === 'west') {
      this.x = this.hitbox.x - 16;  
      this.y = this.hitbox.y;
    }
    if (this.direction === 'northeast' || this.direction === 'southwest') {
      this.x = this.hitbox.x - 8;  
      this.y = this.hitbox.y;
    }
    if (this.direction === 'northwest' || this.direction === 'southeast') {
      this.x = this.hitbox.x - 8;  
      this.y = this.hitbox.y + 6;
    }
  }
  updateHitbox() {
    if (this.direction === 'north' || this.direction === 'south') {
      this.hitbox.x = this.x + 16; 
      this.hitbox.y = this.y;
      this.hitbox.w = 60;
      this.hitbox.h = 46;
    }
    if (this.direction === 'east' || this.direction === 'west') {
      this.hitbox.x = this.x + 16; 
      this.hitbox.y = this.y;
      this.hitbox.w = 52;
      this.hitbox.h = 48;
    }
    if (this.direction === 'northeast' || this.direction === 'southwest') {
      this.hitbox.x = this.x + 8; 
      this.hitbox.y = this.y;
      this.hitbox.w = 60;
      this.hitbox.h = 48;
    }
    if (this.direction === 'northwest' || this.direction === 'southeast') {
      this.hitbox.x = this.x + 8; 
      this.hitbox.y = this.y - 6;
      this.hitbox.w = 60;
      this.hitbox.h = 48;
    }
  }
  display(){
    
    if (this.direction === 'north') this.image[2] = 'idle_north';
    else if (this.direction === 'south') this.image[2] = 'idle_south';
    else if (this.direction === 'east') this.image[2] = 'idle_east';
    else if (this.direction === 'west') this.image[2] = 'idle_west';
    else if (this.direction === 'southwest') this.image[2] = 'idle_southwest';
    else if (this.direction === 'southeast') this.image[2] = 'idle_southeast';
    else if (this.direction === 'northwest') this.image[2] = 'idle_northwest';
    else if (this.direction === 'northeast') this.image[2] = 'idle_northeast';
    
    if(app.devMode) {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.hitbox.x, this.hitbox.y, this.hitbox.w, this.hitbox.h);
    }
    
    ctx.drawImage(pixelart[this.image[0]][this.image[1]][this.image[2]][this.image[3]], this.x-64, this.y-46);
  }
  run(){
    this.update();
    this.updateHitbox();
    this.display();
  }
}

const app = {
  devMode: true, // Set to false to hide hitboxes and debug info
  scene: 'loading',
  player: new Player({x: 100, y: 100}),
  map: new World({data: mapdata.map.room.test, room: 'room'}),
  transitionData: {
    opacity: 1
  },
  transition: function() {
    if(this.transitionData.active) {
      ctx.fillStyle = 'rgba(0, 0, 0, ' + this.transitionData.opacity + ')';
      ctx.fillRect(-64, -64, app.map.width + 128, app.map.height + 128);
      this.transitionData.opacity -= 0.05;
      if(this.transitionData.opacity <= 0) {
        this.transitionData.active = false;
        this.transitionData.opacity = 1;
      }
    }
  },
  runGame: function() {
    // Game logic here
    ctx.clearRect(-64, -64, app.map.width + 128, app.map.height + 128); // Clear with extra padding for lookahead
    this.map.camera();
    this.map.run();
    this.player.run();

    this.transition();
  },
  loadingAnimation: function() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);
  },
  run: function() {
    switch (this.scene) {
      case 'loading':
      loading();
      this.loadingAnimation();
      break;
      case 'game':
      this.runGame();
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  app.run();
  
  keysTyped = {};
}

animate();