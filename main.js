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
  curLoad: [0, 0, 0, 0, 0], // [categoryIdx, subjectIdx, statusIdx, frameIdx, row]
  stepIndex: 0,
  stepMax: 4000,
  tempCanvas: null,
  tempCtx: null,
  pixelFrame: null,
  isLoading: false,
  
  // Start loading a specific frame
  initiate: function (path) {
    this.isLoading = true;
    this.curLoad[4] = 0; // reset row counter
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
    if (this.curLoad[4] >= map.length) return;
    
    this.rowlen = map[this.curLoad[4]].length;
    const step = Math.floor(this.stepMax / this.rowlen);
    
    const startRow = this.curLoad[4];
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
    this.curLoad[4] = endRow;
    
    if (this.curLoad[4] >= map.length) {
      console.log('why??');
      this.stepIndex = 0;
      const path = this.path;
      this.set(path, this.tempCanvas);
    }
  },
  
  renderLoop: function () {
    return this.curLoad[4] < this.pixelFrame.map.length;
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
  ['tiles', 'grass', 0]
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
    this.tileSet = config.data.tileSet;
  }

  getTile(path) {
    let obj = pixelart;
    for (let key of path) {
      obj = obj[key];
      if (obj === undefined) return null;
    }
    return obj;
  }

  drawMap(){
    let w = this.map[0].length;
    let h = this.map.length;
    for(let i = 0; i < h; i++){
      for(let j = 0; j < w; j++){
         ctx.drawImage(this.getTile(this.tileSet[this.map[i][j]]), j*64, i*64);
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
    this.speed = 4;
    
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
    this.x += this.vx;
    this.y += this.vy;
    
    this._prevNorth = north;
    this._prevSouth = south;
    this._prevWest = west;
    this._prevEast = east;
    console.log(this.direction);
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

    ctx.drawImage(pixelart[this.image[0]][this.image[1]][this.image[2]][this.image[3]], this.x, this.y);
  }
  run(){
    this.update();
    this.display();
  }
}

const app = {
  scene: 'loading',
  player: new Player({x: 100, y: 100}),
  map: new World({data: mapdata.map.room.test}),
  runGame: function() {
    // Game logic here
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.map.run();
    this.player.run();
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
}

animate();