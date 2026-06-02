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
  //load-path player sprites
  ['sprites', 'player', 'idle_south', 0],
  ['sprites', 'player', 'idle_north', 0],
  ['sprites', 'player', 'idle_east', 0],
  ['sprites', 'player', 'idle_west', 0],
  ['sprites', 'player', 'idle_southwest', 0],
  ['sprites', 'player', 'idle_southeast', 0],
  ['sprites', 'player', 'idle_northwest', 0],
  ['sprites', 'player', 'idle_northeast', 0],

  //load-path bob sprites
  ['sprites', 'bob', 'idle_south', 0],
  
  //load-path map tiles
  ['tiles', 'floor_wood', 0],
  ['tiles', 'grass', 0],
  ['tiles', 'portal', 0],
  ['tiles', 'wall_stone', 0],
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
    this.sprites = config.data.sprites || {};
    this.hitbox = config.data.hitbox || {};
    this.width = this.map[0].length * 64;
    this.height = this.map.length * 64;

    this.groundMap = config.data.map;           // keep original map for ground
    this.objects = [];                          // entities that need sorting

    this.initiate = true;

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
    const newMapData = mapdata['map']['room'][toMap];
    if (!newMapData) {
      console.error("Map not found:", toMap);
      return;
    }

    // Switch to new map
    this.mapdata = newMapData;
    this.map = newMapData.map;
    this.tileSet = newMapData.tileSet;
    this.portals = newMapData.portals;
    this.sprites = newMapData.sprites || {};
    this.hitbox = newMapData.hitbox || {};

    this.width = this.map[0].length * 64;
    this.height = this.map.length * 64;

    // Important: Reset sprite loading
    this.initiate = true;
    this.objects = [];

    // Find spawn position on the new map
    let spawnX, spawnY;

    const h = this.map.length;
    const w = this.map[0].length;

    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        if (this.map[i][j] === atTile) {
          if (dir === 'north') {
            spawnX = j * 64;
            spawnY = i * 64 - 64;
          } else if (dir === 'south') {
            spawnX = j * 64;
            spawnY = i * 64 + 64;
          } else if (dir === 'east') {
            spawnX = j * 64 + 64;
            spawnY = i * 64;
          } else if (dir === 'west') {
            spawnX = j * 64 - 64;
            spawnY = i * 64;
          }
          break;
        }
      }
    }

    // Apply new position
    app.player.hitbox.x = spawnX;
    app.player.hitbox.y = spawnY;
  }
  
  getTile(path) {
    let obj = pixelart;
    for (let key of path) {
      obj = obj[key];
      if (obj === undefined) return null;
    }
    return obj;
  }

  findTile(x, y) {
    let col = Math.floor(x / 64);
    let row = Math.floor(y / 64);
    if (row < 0 || row >= this.map.length) return null;
    if (col < 0 || col >= this.map[0].length) return null;

    const char = this.map[row][col];
    
    if (this.portals[char]) {
      return {
        type: 'portal',
        x: col * 64,
        y: row * 64,
        w: 64,
        h: 64,
        data: this.portals[char],
        char: char
      };
    } else {
      return {char: char}
    }
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
      return true;
    }
  }

  isSolid(col, row) {
    const tileChar = this.map[row] && this.map[row][col];
    // check map bounds
    if (row < 0 || row >= this.map.length) return true;
    if (col < 0 || col >= this.map[0].length) return true;

    // check hitbox data
    if (this.hitbox[tileChar] && this.hitbox[tileChar].solid) {
      return true;
    }

    // default to non-solid
    return false;
  }

  loadSprites() {
    this.objects = [];

    const h = this.map.length;
    const w = this.map[0].length;

    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        const char = this.map[i][j];

        if (this.sprites[char]) {
          const data = this.sprites[char].sprite;

          const sprite = new Sprite({
            x: j * 64 + (data.offsetX || -74),
            y: i * 64 + (data.offsetY || -32),
            frameData: data.frames,
            frameDuration: data.frameDuration || 200,
            pivotY: data.pivotY,
            data: data
          });

          this.objects.push(sprite);
        }
      }
    }
    this.initiate = false;
  }

  // Draw only ground tiles (floors, base of walls, etc.)
  drawGround() {
    const h = this.map.length;
    const w = this.map[0].length;

    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        const char = this.map[i][j];

        let tilePath = this.tileSet[char];

        if (this.portals[char]) {
          tilePath = this.tileSet[this.portals[char].tile];
        } else if (this.hitbox[char]) {
          tilePath = this.tileSet[this.hitbox[char].tile];
        } else if (this.sprites[char]) {
          tilePath = this.tileSet[this.sprites[char].tile];
        }

        if (tilePath) {
          ctx.drawImage(this.getTile(tilePath), j * 64, i * 64);
        }
      }
    }
  }
  
  run(){
    if (this.initiate) this.loadSprites();

    this.drawGround();
  }
}

class Sprite {aw
  constructor(config) {
    this.x = config.x || 0; 
    this.y = config.y || 0;
    this.frameData = config.frameData;// array of paths for drawing frames
    this.frameDuration = config.frameDuration || 200;
    this.currentFrame = 0;
    this.lastFrameTime = Date.now();
    this.name = config.data.name || 'unknown';

    //dialogue properties
    this.talkIndex = 0;
    this.dialoguePath = config.data.dialogue || null; //should return array

    this.hitbox = {
      x: (this.x - config.data.offsetX) + (config.data.hitboxOffset.x || 0),
      y: (this.y - config.data.offsetY) + (config.data.hitboxOffset.y || 0),
      w: config.data.hitboxOffset.w || 64,
      h: config.data.hitboxOffset.h || 64,
      solid: true
    };

    console.log(`Loaded sprite "${this.name}" with hitbox:`, this.hitbox, 'from config:', config);

    let offsetX = -16;
    let offsetY = -16;
    let offsetW = 96;
    let offsetH = 96;

    if (config.data.talkHitboxOffset) {
      offsetX = config.data.talkHitboxOffset.x;
      offsetY = config.data.talkHitboxOffset.y;
      offsetW = config.data.talkHitboxOffset.w;
      offsetH = config.data.talkHitboxOffset.h;
    }

    this.talkHitbox = {
      x: (this.x - config.data.offsetX) + offsetX,
      y: (this.y - config.data.offsetY) + offsetY,
      w: offsetW,
      h: offsetH
    };

    // Crucial for depth sorting
    this.pivotY = config.pivotY || 64;// Y offset to the "feet" / base of sprite
    this.sortY = this.y + this.pivotY;
  }

  checkCollision() {
    let player = app.player.hitbox;
    if (this.hitbox.solid && collide.rectToRect(player, this.hitbox)) {
      // Simple collision response: push player out of sprite
      const overlapX = Math.min(player.x + player.w, this.hitbox.x + this.hitbox.w) - Math.max(player.x, this.hitbox.x);
      const overlapY = Math.min(player.y + player.h, this.hitbox.y + this.hitbox.h) - Math.max(player.y, this.hitbox.y);

      if (overlapX < overlapY) {
        // Horizontal collision
        if (player.x < this.hitbox.x) {
          player.x -= overlapX; // push left
        } else {
          player.x += overlapX; // push right
        }
      } else {
        // Vertical collision
        if (player.y < this.hitbox.y) {
          player.y -= overlapY; // push up
        } else {
          player.y += overlapY; // push down
        }
      }
    }
  }

  detectPlayer() {
    let player = app.player.hitbox;
    if (collide.rectToRect(player, this.talkHitbox)) {
      // Player is within interaction range
      // Trigger dialogue or interaction logic
      return true;
    }

    if (app.devMode) {
      // Draw talk hitbox for debugging
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.talkHitbox.x, this.talkHitbox.y, this.talkHitbox.w, this.talkHitbox.h);
    }

    return false;
  }

  update() {
    if (Date.now() - this.lastFrameTime > this.frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.frameData.length;
      this.lastFrameTime = Date.now();
    }
  }

  drawHitbox() {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(this.hitbox.x, this.hitbox.y, this.hitbox.w, this.hitbox.h);
  }

  drawPivot() { 
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.hitbox.x, this.y + this.pivotY, 6, 6);
  }

  getImage() {
    const path = this.frameData[this.currentFrame];
    let obj = pixelart;
    for (let key of path) {
      obj = obj[key];
      if (obj === undefined) return null;
    }
    return obj;
  }

  draw() {
    this.update();
    if(this.detectPlayer() && app.scene !== 'dialogue' && keysTyped.z) {
      // Trigger dialogue or interaction logic here
      if (app.scene !== 'dialogue') {
        app.scene = 'dialogue';
        dialogue.init(this.name, this.dialoguePath[this.talkIndex]);
      }
    }
    const img = this.getImage();
    if (img) {
      ctx.drawImage(img, this.x, this.y);
    }

    if (app.devMode && keys['Shift']) {
      this.drawHitbox();
      this.drawPivot();
    }
  }
}

class Player {
  constructor(config) {
    this.vx = 0;
    this.vy = 0;
    this.speed = 6;
    
    this.direction = 'south';
    this.image = ['sprites', 'player', 'idle_south', 0];

    // Hitbox = source of truth (top-left)
    this.hitbox = {
      x: config.x || 100,
      y: config.y || 100,
      w: 46,
      h: 46
    };

    // Visual offset from hitbox top-left
    this.visualOffset = {
      x: 40,
      y: -12
    };
  }

  get sortY() {
    return this.hitbox.y + this.hitbox.h;   // feet position
  }

  update() {
    if (app.transition?.active && app.transition.phase === 'fadeOut') return;

    this.vx = this.vy = 0;
    let speed = this.speed;

    const north = !!keys['ArrowUp'] || !!keys['w'];
    const south = !!keys['ArrowDown'] || !!keys['s'];
    const west  = !!keys['ArrowLeft'] || !!keys['a'];
    const east  = !!keys['ArrowRight'] || !!keys['d'];

    // Direction logic
    let horz = 0, vert = 0;

    if (north) vert -= 1;
    if (south) vert += 1;
    if (west)  horz -= 1;
    if (east)  horz += 1;

    if (horz !== 0 || vert !== 0) {
      const len = Math.hypot(horz, vert);
      this.vx = (horz / len) * speed;
      this.vy = (vert / len) * speed;

      // Update facing direction
      if (horz === 0) {
        this.direction = vert < 0 ? 'north' : 'south';
      } else if (vert === 0) {
        this.direction = horz < 0 ? 'west' : 'east';
      } else {
        // Diagonal
        this.direction = (vert < 0 ? 'north' : 'south') + (horz < 0 ? 'west' : 'east');
      }
    }

    // Collision
    const moved = this.checkCollision(
      this.hitbox.x,
      this.hitbox.y,
      this.hitbox.w,
      this.hitbox.h,
      this.vx,
      this.vy
    );

    this.hitbox.x += moved.vx;
    this.hitbox.y += moved.vy;

    // World bounds
    this.hitbox.x = Math.max(0, Math.min(this.hitbox.x, app.map.width - this.hitbox.w));
    this.hitbox.y = Math.max(0, Math.min(this.hitbox.y, app.map.height - this.hitbox.h));
  }

  checkCollision(x, y, w, h, vx, vy) {
    const TILE = 64;
    const result = { vx, vy };

    // Horizontal
    if (vx > 0) {
      const col = Math.floor((x + w + vx) / TILE);
      const rowTop = Math.floor((y + 1) / TILE);
      const rowBot = Math.floor((y + h - 1) / TILE);
      if (app.map.isSolid(col, rowTop) || app.map.isSolid(col, rowBot)) {
        result.vx = col * TILE - w - x;
      }
    } else if (vx < 0) {
      const col = Math.floor((x + vx) / TILE);
      const rowTop = Math.floor((y + 1) / TILE);
      const rowBot = Math.floor((y + h - 1) / TILE);
      if (app.map.isSolid(col, rowTop) || app.map.isSolid(col, rowBot)) {
        result.vx = (col + 1) * TILE - x;
      }
    }

    // Vertical
    if (vy > 0) {
      const row = Math.floor((y + h + vy) / TILE);
      const colLeft = Math.floor((x + 1) / TILE);
      const colRight = Math.floor((x + w - 1) / TILE);
      if (app.map.isSolid(colLeft, row) || app.map.isSolid(colRight, row)) {
        result.vy = row * TILE - h - y;
      }
    } else if (vy < 0) {
      const row = Math.floor((y + vy) / TILE);
      const colLeft = Math.floor((x + 1) / TILE);
      const colRight = Math.floor((x + w - 1) / TILE);
      if (app.map.isSolid(colLeft, row) || app.map.isSolid(colRight, row)) {
        result.vy = (row + 1) * TILE - y;
      }
    }

    return result;
  }

  checkPortals() {
    const TILE = 64;
    const left   = Math.floor(this.hitbox.x / TILE);
    const right  = Math.floor((this.hitbox.x + this.hitbox.w - 1) / TILE);
    const top    = Math.floor(this.hitbox.y / TILE);
    const bottom = Math.floor((this.hitbox.y + this.hitbox.h - 1) / TILE);

    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (row < 0 || row >= app.map.map.length || col < 0 || col >= app.map.map[0].length) continue;

        const char = app.map.map[row][col];
        const portalData = app.map.portals[char];

        if (portalData) {
          console.log(`Portal activated → ${portalData.dest} (${char})`);

          // Load new map and place player
          app.map.loadMap(portalData.dest, char, portalData.direction);
          app.transitionData.active = true;
          return; // Only trigger once per frame
        }
      }
    }
  }

  updateVisuals() {
    // Update sprite based on direction
    const dirMap = {
      north: 'idle_north',
      south: 'idle_south',
      east: 'idle_east',
      west: 'idle_west',
      northwest: 'idle_northwest',
      northeast: 'idle_northeast',
      southwest: 'idle_southwest',
      southeast: 'idle_southeast'
    };
    this.image[2] = dirMap[this.direction] || 'idle_south';
  }

  getVisualPos() {
    return {
      x: this.hitbox.x + this.visualOffset.x,
      y: this.hitbox.y + this.visualOffset.y
    };
  }

  display() {
    this.updateVisuals();
    const pos = this.getVisualPos();

    if (app.devMode) {
      // Collision box
      ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
      ctx.fillRect(this.hitbox.x, this.hitbox.y, this.hitbox.w, this.hitbox.h);
      
      // Center point
      ctx.fillStyle = 'yellow';
      ctx.fillRect(this.hitbox.x + this.hitbox.w/2 - 3, this.hitbox.y + this.hitbox.h/2 - 3, 6, 6);
    }

    ctx.drawImage(
      pixelart[this.image[0]][this.image[1]][this.image[2]][this.image[3]],
      pos.x - 64,
      pos.y - 46
    );
  }

  run() {
    this.checkPortals();
    this.update();
  }
}

const app = {
  devMode: true, // Set to false to hide hitboxes and debug info
  scene: 'loading',
  player: new Player({x: 100, y: 100}),
  //sprites: [],
  map: new World({data: mapdata.map.room.test, room: 'room'}),
  transitionData: {
    opacity: 1
  },
  transition: function() {
    if(this.transitionData.active) {
      ctx.fillStyle = 'rgba(0, 0, 0, ' + this.transitionData.opacity + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.transitionData.opacity -= 0.05;
      if(this.transitionData.opacity <= 0) {
        this.transitionData.active = false;
        this.transitionData.opacity = 1;
      }
    }
  },
  runGame: function() {
    // Game logic here
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear with extra padding for lookahead
    ctx.save();
      this.map.camera();
      this.map.run();
      if (app.scene !== 'dialogue') {
        this.player.run();
      }

      let entities = [
        ...this.map.objects,
        this.player
      ];

      entities.sort((a, b) => (a.sortY || 0) - (b.sortY || 0));

      for (let entity of entities) {
        if (entity.draw) entity.draw();           // sprites
        else if (entity.display) {
          for (let obj of this.map.objects) {
            obj.checkCollision();
          }
          entity.display();
        } // player
      }
      
    ctx.restore();

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
        break;
      case 'dialogue':
        this.runGame(); // still show game in background
        dialogue.runDialogue();
        break;
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  app.run();
  
  keysTyped = {};
}

animate();