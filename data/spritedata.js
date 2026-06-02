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
    offsetX: -74, // X offset for drawing the sprite
    offsetY: -32, // Y offset for drawing the sprite
    pivotY: 96, // Y offset to the "feet" / base of sprite
    hitboxOffset: {x: 4, y: 12, w: 56, h: 48}, // Hitbox offset and size
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
    offsetX: -42,
    offsetY: -72,
    pivotY: 124,
    hitboxOffset: {x: -24, y: -12, w: 108, h: 72},
    dialogue: ['exampleScene.bobEncounter.bob.greet'],
    talkIndex: 0 
  }
};