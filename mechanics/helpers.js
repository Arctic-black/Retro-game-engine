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
  sawIntro: false,
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
  optionsIndex: "none", //start with no option selected
  counter: 0,
  speed: 0.5,
  canSpeedUp: true, // Flag to control if speeding up is allowed
  pause: 10,
  speaker: null,
  
  // Evaluate if a node or option is available
  checkCondition: function(condition) {
  if (condition === null || condition === undefined) return true;
  if (typeof condition === 'function') {
      const result = condition();
      if (typeof result !== 'boolean') {
    console.warn('Condition function did not return a boolean:', condition);
      }
      return result;
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

  const moveUp = keysTyped['ArrowUp'] || keysTyped['w'];
  const moveDown = keysTyped['ArrowDown'] || keysTyped['s'];

  if (this.optionsIndex === "none") {
      if (moveDown || moveUp) {
    this.optionsIndex = 0; // Start navigating options
    return; //A drag path etched in the surface
    //As evidance I left there on purpose
      }
      return; // Don't navigate if no movement keys are pressed
  }
  
  if (moveUp) {
      this.optionsIndex = (this.optionsIndex - 1 + this.options.length) % this.options.length;
  }
  if (moveDown) {
      this.optionsIndex = (this.optionsIndex + 1) % this.options.length;
  }
  },
  
  init: function(speaker, dataOrPath) {
  this.active = true;
  this.speaker = speaker;
  this.counter = 0;
  this.index = 0;
  this.optionsIndex = "none";
  
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
  const visibleLines = this.getVisibleLines(this.node.lines);

  if (this.index < visibleLines.length) {
    const currentLine = this.getCurrentLine();
    let displayText = typeof currentLine === 'string' ? currentLine : currentLine.text;

    if (typeof displayText === 'string') {
      const visibleLength = Math.floor(this.counter);

      // Draw text
      textarea(displayText.substring(0, visibleLength), 70, canvas.height - 180, canvas.width - 140, 160, 30);

      if (this.pause < 0) {
        this.counter += this.speed;

        // Add extra pause when we just revealed a punctuation mark
        if (visibleLength < displayText.length) {
          const currentChar = displayText[visibleLength-1];

          if (['.', '!', '?'].includes(currentChar)) {
            this.pause = 20;        // Big pause after sentence end
          } else if (currentChar === ',') {
            this.pause = 10;        // Small pause after comma
          } else if (currentChar === ';') {
            this.pause = 15;        // Medium pause after semicolon
          }
        }
      } else {
        this.pause --;
      }

      // Skip text with X
      if (keysTyped.x) {
        this.counter = displayText.length + 10;
      }

      // Speed up with C held
      if (keys.c) {
        this.counter += this.speed * 3;
      }

      // Go to next line when text is fully shown + player presses Z
      if (this.counter >= displayText.length && keysTyped.z) {
        if (currentLine.setFlags) {
          Object.assign(game.flags, currentLine.setFlags);
        }
        if (currentLine.next) {
          this.init(this.speaker, currentLine.next);
          return;
        } else {
          this.counter = 0;
          this.index++;
        }
      }
    } else if (this.counter >= fullLength && keysTyped.z) {
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
    if (i < 3) {
          ctx.fillText(option.text, 70, canvas.height - 150 + i * 35);
    } else {
          //display more than 3 options in a column on the right side of the box
          ctx.textAlign = 'right';
          ctx.fillText(option.text, canvas.width - 70, canvas.height - 150 + (i - 3) * 35);
    }
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

      keys.z = false;
  }
  }
};