const cutscenes = {
  exampleIntro: [
    { type: "wait", duration: 800 },
    { type: "move", target: "player", x: 600, y: 400, speed: 3 },
    { type: "dialogue", speaker: "bob", node: "bobCutscene.bob.opening" },
    { type: "create", entity: "bob", x: 1200, y: 300 },
    { type: "move", target: "bob", x: 600, y: 360, speed: 4 },
    { type: "camera", focus: "bob", lookahead: 0 },
    { type: "dialogue", speaker: "player", node: "bobCutscene.player.response" },
    { type: "move", target: "bob", x: 1000, y: 300, speed: 4},
    { type: "wait", duration: 600 },
    { type: "end" }
  ],
};

let cutsceneManager = {
  activeDialogue: false,
  run: function() {
    if (!app.cutscene.active) return;

    console.log("running cutscene \n at cutscene:", app.cutscene.currentScene, "\nscript:",  cutscenes['exampleIntro']);
    
    const cs = app.cutscene;
    const script = cutscenes[cs.currentScene];
    if (!script) return;

    const currentStep = script[cs.step];
    this.currentStep = currentStep; // Store current step for access in speedUpStep 
    if (!currentStep) return;

    cs.timer += 16; // approx one frame

    // Allow skipping
    if (cs.skippable && (keys.c || keysTyped.enter)) {
      this.speedUpStep(currentStep);
    }

    switch (currentStep.type) {
      case "wait":
        if (cs.timer >= currentStep.duration) this.nextStep();
        break;

      case "dialogue":
        if (!this.activeDialogue) {
          dialogue.init(currentStep.speaker, currentStep.node);
          this.activeDialogue = true;
        }
        if (!dialogue.active) {
          this.activeDialogue = false;
          this.nextStep();
        }
        break;

      case "create":
        let newEntity = app.createEntity(currentStep.entity, currentStep.x, currentStep.y);
        console.log("Created entity:", newEntity);
        this.nextStep();
        break;

      case "move":
        this.moveEntity(currentStep);
        break;

      case "camera":
        this.setCameraFocus(currentStep);
        break;

      case "fadeOut":
        app.transitionData.active = true;
        if (app.transitionData.opacity <= 0) this.nextStep();
        break;

      case "end":
        this.finishCutscene();
        break;
    }

    
  },

  speedUpStep: function(step) {
    switch (step.type) {
      case "move":
        this.currentStep.speed = 8; // Speed up movement to finish quickly
        break;
    }
  },

  nextStep: function() {
    app.cutscene.timer = 0;
    app.cutscene.step++;
  },

  moveEntity: function(step) {
    let entity = step.target === "player" ? app.player.hitbox : this.findSprite(step.target);
    if (!entity) {
      console.warn(`moveEntity: target "${step.target}" not found`);
      this.nextStep();
      return;
    }

    const to = { x: step.x, y: step.y };
    const dx = to.x - entity.x;
    const dy = to.y - entity.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1) {
      // Normalized movement
      const speed = step.speed || 4;
      const moveX = (dx / dist) * speed;
      const moveY = (dy / dist) * speed;

      entity.x += moveX;
      entity.y += moveY;

      // Snap when very close to prevent floating-point jitter
      if (Math.abs(dx) < speed * 1.5) entity.x = to.x;
      if (Math.abs(dy) < speed * 1.5) entity.y = to.y;

    } else {
      // Already at destination
      entity.x = to.x;
      entity.y = to.y;
    }

    console.log(`Moving ${step.target}: (${Math.round(entity.x)}, ${Math.round(entity.y)}) → (${to.x}, ${to.y})`);

    // Check if we reached the target
    if (Math.abs(entity.x - to.x) < 2 && Math.abs(entity.y - to.y) < 2) {
      entity.x = to.x;
      entity.y = to.y;
      this.nextStep();
    }
  },

  findSprite: function(name) {
    return app.map.objects.find(s => s.name === name);
  },

  setCameraFocus: function(step) {
    const world = app.map;
    
    if (step.focus === "player") {
      world.camdata.focus = app.player.hitbox;   // better to use hitbox as focus
    } else {
      const sprite = this.findSprite(step.focus);
      if (sprite) {
        world.camdata.focus = sprite.hitbox || sprite;  // prefer hitbox if available
      }
    }
    
    world.camdata.lookahead = step.lookahead !== undefined ? step.lookahead : 46;
    
    this.nextStep();
  },

  finishCutscene: function() {
    app.cutscene.active = false;
    app.map.camdata.focus = null; // reset camera focus to player
    app.scene = 'game';
    if (typeof app.cutscene.onComplete === 'function') {
      app.cutscene.onComplete();
    }
  }
};