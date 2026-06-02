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

//kinda like the semi-savefile for flags, quests, reputation, etc.
const game = {
  flags: {
    metSpeakerBefore: false,
    ignoredSpeaker: false,
    gaveSteel: false,
    // quest progress, reputation, etc.
  },
  variables: {
    playerReputation: 0,
    timesTalked: 0
  },
  
  setFlag: function(flag, value = true) {
    this.flags[flag] = value;
  },
  
  getFlag: function(flag) {
    return this.flags[flag] === true;
  }
};

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '',
    currentY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function textarea(text, x, y, w, h, lineHeight) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  wrapText(ctx, text, x + 20, y + 20, w - 40, lineHeight || 20);
  console.log('lineHeight:', lineHeight);
}

let dialogue = {
  active: false,
  node: null, // Current dialogue node
  index: 0,
  optionsIndex: 0,
  counter: 0,
  speed: 0.5,
  canSpeedUp: true, // Flag to control if speeding up is allowed
  pause: 10,
  speaker: null,
  
  // Evaluate if a node or option is available
  checkCondition: function(condition) {
    if (condition === null || condition === undefined) return true;
    if (typeof condition === 'function') {
      return condition();           // Can access game.flags, player, etc.
    }
    return false;
  },
  
  getAvailableOptions: function(options) {
    return options.filter(opt => this.checkCondition(opt.condition));
  },
  
  getDialogueByPath: function(path) {
    if (typeof path !== 'string') {
      console.error('getDialogueByPath received invalid path (not a string):', path);
      return null;
    }
    if (!path) {
      console.error('Empty path provided');
      return null;
    }
    
    let parts = path.split('.');
    let current = dialogueData;
    
    for (let part of parts) {
      const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);
      
      if (arrayMatch) {
        const key = arrayMatch[1];
        const index = parseInt(arrayMatch[2]);
        
        if (current[key] === undefined) {
          console.error('Path not found:', path);
          return null;
        }
        current = current[key];
        
        if (Array.isArray(current)) {
          current = current[index];
        } else {
          console.error('Expected array at:', key);
          return null;
        }
      } 
      else if (current[part] !== undefined) {
        current = current[part];
      } 
      else {
        console.error('Path not found:', path);
        return null;
      }
    }
    return current;
  },

  getVisibleLines: function(lines) {
    if (!Array.isArray(lines)) return [];
    
    return lines.filter(line => {
      if (typeof line === 'string') return true;
      if (line && line.text) {
        return this.checkCondition(line.condition);
      }
      return false;
    });
  },
  
  getCurrentLine: function() {
    const visibleLines = this.getVisibleLines(this.node.lines);
    return visibleLines[this.index] || null;
  },

  selectOption: function() {
    const option = this.options[this.optionsIndex];
    if (!option) return;
    
    if (keysTyped.z || keysTyped.enter) {
      if (option.setFlags) {
        Object.assign(game.flags, option.setFlags);
      }
      this.init(this.speaker, option.next);
    }
  },
  
  navigateOptions: function() {
    if (!this.options.length) return;
    
    if (keysTyped['ArrowUp'] || keysTyped['w']) {
      this.optionsIndex = (this.optionsIndex - 1 + this.options.length) % this.options.length;
    }
    if (keysTyped['ArrowDown'] || keysTyped['s']) {
      this.optionsIndex = (this.optionsIndex + 1) % this.options.length;
    }
  },
  
  init: function(speaker, dataOrPath) {
    this.active = true;
    this.speaker = speaker;
    this.counter = 0;
    this.index = 0;
    this.optionsIndex = 0;
    
    let node;
    
    if (typeof dataOrPath === 'string') {
      node = this.getDialogueByPath(dataOrPath);
    } else {
      node = dataOrPath;
    }
    
    if (!node || typeof node !== 'object') {
      console.error("Invalid dialogue node:", dataOrPath);
      this.active = false;
      return;
    }
    
    // Check node-level condition
    if (!this.checkCondition(node.condition)) {
      console.log("Node condition not met.");
      this.active = false;
      return;
    }
    
    this.node = node;
    this.options = this.getAvailableOptions(node.options || []);
    
    console.log(`Dialogue node started: ${speaker} → ${Object.keys(node)}`);
  },
  
  runDialogue: function() {
    if (!this.active || !this.node) return;
    
    // Draw box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(10, canvas.height - 200, canvas.width - 20, 190);
    
    ctx.fillStyle = 'white';
    ctx.font = '26px Fantasy';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    
    if (this.index < this.getVisibleLines(this.node.lines).length) {
      const currentLine = this.getCurrentLine();
      
      //checking if text is a string or an object with text and condition
      let displayText = typeof currentLine === 'string' 
                        ? currentLine 
                        : currentLine.text;

      //display strings typewriter style
      if (typeof displayText === 'string') {
        const visible = Math.floor(this.counter);
        textarea(displayText.substring(0, visible), 70, canvas.height - 180, canvas.width - 140, 160, 30);
      }

      const fullLength = typeof displayText === 'string' ? displayText.length : 0;

      if (keys.x && this.canSpeedUp) {
        //speed up text if x is held
        this.counter = fullLength; // Increase speed multiplier for faster text
      } else {
        this.counter += this.speed;
      }

      if (this.counter >= fullLength && keysTyped.z) {
        if (currentLine.setFlags) {
          Object.assign(game.flags, currentLine.setFlags);
        }

        if (currentLine.next) {
          this.init(this.speaker, currentLine.next);
          return;
        } else {
          // Move to next line
          this.counter = 0;
          this.canSpeedUp = true; // Allow speeding up for the next line
          this.index++;
        }

      }
    }
    else if (this.options.length) {
      this.navigateOptions();
      // draw options
      this.options.forEach((option, i) => {
        ctx.fillStyle = (i === this.optionsIndex) ? 'yellow' : 'white';
        ctx.fillText(option.text, 70, canvas.height - 150 + i * 35);
      });

      this.selectOption();

      if (this.node.setFlags) {
        Object.assign(game.flags, this.node.setFlags);
      }
    } 
    else {
      // End of node with no options
      if (this.node.setFlags) {
        Object.assign(game.flags, this.node.setFlags);
      }
      this.active = false;
      app.scene = 'game';

      keys.z = false;
    }
  }
};