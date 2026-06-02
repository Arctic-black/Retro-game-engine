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

let dialogue = {
  active: false,
  counter: 0,
  speaker: null,
  speed: 0.5, //milliseconds per character
  pause: 100, //pause between lines of dialogue
  index: 0,
  optionsIndex: 0,
  currentText: '',
  fullText: '',
  options: [],
  getOptions: function(data) {
    let obj = [];
    data.forEach(part => {
      if (typeof part === 'object' && part.option) {
        obj.push(part);
      }
    });
    return obj;
  },
  selectOption: function(index) {
    let option = this.options[index];
    
    if (keys.z) {
      if (option && option.next) {
        // Navigate to the next dialogue based on the option's 'next' property
        let nextDialogue = this.getDialogueByPath(option.next);
        console.log('dialogue', nextDialogue);
        if (nextDialogue) {
          this.init(this.speaker, nextDialogue);
        } else {
          console.error('Next dialogue not found for path:', option.next);
        }
      } else {
        console.error('Invalid option selected:', option);
      }
    }
  },
  getDialogueByPath: function(path) {
    if (!path) return null;
    
    let parts = path.split('.');
    let current = dialogueData;
    
    for (let part of parts) {
      // Handle array notation like "dialogue[2]" or "choices[0]"
      const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);
      
      if (arrayMatch) {
        const key = arrayMatch[1];      // e.g. "dialogue"
        const index = parseInt(arrayMatch[2]); // e.g. 2
        
        // Access the property first
        if (current[key] === undefined) {
          console.error('Dialogue path not found:', path);
          return null;
        }
        
        current = current[key];
        
        // Then access the array index
        if (Array.isArray(current)) {
          if (current[index] === undefined) {
            console.error(`Array index ${index} out of bounds at:`, path);
            return null;
          }
          current = current[index];
        } else {
          console.error(`Expected array but got ${typeof current} at:`, key);
          return null;
        }
      }
      // Normal object property access
      else if (current[part] !== undefined) {
        current = current[part];
      } 
      else {
        console.error('Dialogue path not found:', path);
        return null;
      }
    }

    console.log('Retrieved dialogue for path:', path, current);
    
    return current;
  },
  init: function(speaker, data) {
    this.active = true;
    this.speaker = speaker;
    this.counter = 0;
    this.currentText = '';
    this.index = 0; //index for tracking current line of dialogue
    this.fullText = data[0]; //first element is the dialogue text
    this.options = this.getOptions(data); //rest are options
    
    console.log('Initialized dialogue with speaker:', speaker);
    console.log('Full text:', this.fullText);
    console.log('Options:', this.options);
    console.log('Dialogue data:', data);
  },
  runDialogue: function() {
    // This function would handle displaying dialogue and options to the player
    // For example, it could create a dialogue box UI and populate it with the text and options from dialogueData
    console.log('Running dialogue:', this.fullText[this.index]); //should be an array of dialogue lines and options
    //display dialogue box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, canvas.height - 200, canvas.width - 20, 190);
    
    ctx.fillStyle = 'white';
    ctx.font = '26px Fantasy';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    
    if (this.index < this.fullText.length) {
      ctx.fillText(this.fullText[this.index].substring(0, this.counter), 70, canvas.height - 180); //display current line of dialogue
      this.counter += this.speed; //increment counter to show more text over time
      
      //move to next line of dialogue if current line is fully shown
      if(this.counter >= this.fullText[this.index].length + this.pause*this.speed) {
        this.counter = 0; //reset counter for next line
        this.index++; //move to next line
      }
    } else {
      //display options if dialogue is fully shown
      this.selectOption(this.optionsIndex); //check for option selection
      this.options.forEach((option, index) => {
        if (index === this.optionsIndex) {
          ctx.fillStyle = 'yellow'; //highlight selected option
        } else {
          ctx.fillStyle = 'white';
        }
        ctx.fillText(option.option, 70, canvas.height - 150 + index * 30); //display options below dialogue
      });
    }
  }
}
