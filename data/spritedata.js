const spritedata = {
  testSprite: {
    name: 'testSprite',
    type: 'sprite',
    frames: [
      ['sprites', 'player', 'idle_south', 0],
      ['sprites', 'player', 'idle_southwest', 0],
      ['sprites', 'player', 'idle_west', 0],
      ['sprites', 'player', 'idle_northwest', 0],
      ['sprites', 'player', 'idle_north', 0],
      ['sprites', 'player', 'idle_northeast', 0],
      ['sprites', 'player', 'idle_east', 0],
      ['sprites', 'player', 'idle_southeast', 0],
    ],
    frameDuration: 200, // Duration of each frame in milliseconds
    offsetX: -10, // X offset for drawing the sprite
    offsetY: -36, // Y offset for drawing the sprite
    pivotY: 96, // Y offset to the "feet" / base of sprite
    hitboxOffset: {x: 4, y: 12, w: 56, h: 48}, // Hitbox offset and size
    talkHitboxOffset: {x: -4, y: -4, w: 72, h: 88}, // Interaction hitbox offset and size
    dialogue: ['exampleScene.exampleEncounter.exampleSpeaker.greet'],
    talkIndex: 0 // To track which dialogue line to use when talking
  },
  bob: {
    name: 'bob',
    type: 'sprite',
    frames: [
      ['sprites', 'bob', 'idle_south', 0]
    ],
    frameDuration: 200,
    offsetX: -16,
    offsetY: -36,
    pivotY: 96,
    hitboxOffset: {x: 0, y: 10, w: 72, h: 48},
    dialogue: ['exampleScene.bobEncounter.bob.greet'],
    talkIndex: 0 
  }
};