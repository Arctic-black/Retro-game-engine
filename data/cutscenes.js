const cutscenes = {
  exampleIntro: [
    { type: "wait", duration: 800 },
    { type: "move", target: "player", x: 600, y: 400, speed: 3 },
    { type: "dialogue", speaker: "bob", node: "bobCutscene.bob.opening" },
    { type: "create", entity: "bob", x: 1200, y: 300 },
    { type: "move", target: "bob", x: 600, y: 360, speed: 4 },
    { type: "camera", focus: "bob", lookahead: 0 },
    { type: "dialogue", speaker: "player", node: "bobCutscene.player.response" },
    { type: "wait", duration: 600 },
    { type: "fadeOut" },
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
    if (!currentStep) return;

    console.log("current step:", currentStep);

    cs.timer += 16; // approx one frame

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

    // Allow skipping
    if (cs.skippable && (keys.z || keys.enter)) {
      //this.finishCutscene();
    }
  },

  nextStep: function() {
    app.cutscene.timer = 0;
    app.cutscene.step++;
  },

  moveEntity: function(step) {
    let entity = step.target === "player" ? app.player.hitbox : this.findSprite(step.target);
    let to = { x: step.x, y: step.y };
    if (!entity) return;

    const dx = to.x - entity.x;
    const dy = to.y - entity.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      entity.x += Math.round((dx / dist) * step.speed);
      entity.y += Math.round((dy / dist) * step.speed);
    } else {
      entity.x = to.x;
      entity.y = to.y;
      this.nextStep();
    }

    console.log(`Moving ${step.target}: (${entity.x}, ${entity.y}) → (${to.x}, ${to.y})`);
    console.log(entity);
  },

  findSprite: function(name) {
    return app.map.objects.find(s => s.name === name);
  },

  setCameraFocus: function(step) {
    // Temporarily override camera behavior
    app.map.camdata.focus = step.focus === "player" ? app.player : this.findSprite(step.focus);
    app.map.camdata.lookahead = step.lookahead || 0;
    this.nextStep();
  },

  finishCutscene: function() {
    app.cutscene.active = false;
    app.scene = 'game';
    if (typeof app.cutscene.onComplete === 'function') {
      app.cutscene.onComplete();
    }
  }
};