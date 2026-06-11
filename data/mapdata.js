const tiles = {
  default: {
    a: ['tiles', 'floor_wood', 0],
    b: ['tiles', 'grass', 0],
    c: ['tiles', 'portal', 0],
    d: ['tiles', 'wall_stone', 0],
  }
};

let mapdata = {
  map: {
    room: { 
      'test': {
        tileSet: tiles.default,
        portals: {'@': { dest: 'test2', tile: 'c', direction: 'east'}},
        hitbox: {'1': {tile: 'd', solid: true}},
        sprites: {'&': {tile: 'd', solid: true, sprite: spritedata.testSprite}},
        map: [
          "aaaaaaaaaaaaabbbbbbb",
          "aaaaaaaaaaaaabbbbbbb",
          "aaaaa&aaaaaaabbbbbbb",
          "aaaaaaaaaaaaabbbbbbb",
          "aaaaaaaaaaaaabbbbbbb",
          "aaaaaaaaaaaa11bbbbbb",
          "bbbbbbbbbbbb@1bbbbbb",
          "aaaaaaaaaaaa11bbbbbb",
          "aaaaaaaaaaaaabbbbbbb",
          "aaaaaaa111aaabbbbbbb",
          "aaaaaaaaa11aabbbbbbb",
          "aaaaaaaaaa1aabbbbbbb",
        ]
      },
      'test2': {
        tileSet: tiles.default,
        portals: {
          '@': { dest: 'test', tile: 'b', direction: 'west'},
          'µ': { dest: 'test3', tile: 'c', direction: 'south'}
        },
        hitbox: {'1': {tile: 'd', solid: true}},
        sprites: {'&': {tile: 'b', solid: true, sprite: spritedata.bob}},
        map: [
          "1111aaaaaaaaabbbbbb",
          "@bbbbbaaaaaaabbbbbb",
          "1111abbbbbaaa&bbbbb",
          "aaaaaaaaabaaabbbbbb",
          "aaaaaaaaabaaabbbbbb",
          "aaaaaaaaabaaabbbbbb",
          "bbbbbbbbbbbbbbbbbbb",
          "aaaaaaaaabaaabbbbbb",
          "aaaabbbbbbbbabbbbbb",
          "aaabbaaaaaababbbbbb",
          "aabbaaaaaaabb111111",
          "aabaaaaaaa1µ1111111",
        ]
      },
      'test3': {
        tileSet: tiles.default,
        portals: {
          'µ': {dest: 'test2', tile: 'b', direction: 'north'},
          '@': {dest: 'test', tile: 'd', direction: 'west'}
        },
        hitbox: {
          '1': {tile: 'd', solid: true}
        },
        map: [
          "111µ1111---------------------------------------------------------",
          "--1bbbb111111111111111111--111111111111111111111111111111111111",
          "--1bbbbbbbbbbbbbbbbbbbbb1--1bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb1",
          "111bb1111111111b111111111--1b11111bb111111111111111111111111111",
          "1bbbbbbbbbb1--1bbb1--------1b1---1bb1",
          "1bbbbbbbb1b1--1bb11111111111b11--1bb1",
          "1b1bbbbbb1b1--1bbbbbbbbbbbbbb11--1bb1",
          "1111111111b1--111111111b1111111--1bb1",
          "---1bbbbbbb1-------1111b1--------1bb1",
          "---1b1111111-1111111bbbb1--------1bb1",
          "---1b1bbbbbbbbbbbbbbb1111--------1bb1",
          "---1b1bbbb111111111111-----------1bb1",
          "---1b1bbbb111111111111-----------1bb1",
          "---1b1bbbbbbbbbbbbbbb1111--------1bb1",
          "---1b111111111111111b1111--------1bb1111111111111111111111111111",
          "---1b1-------------1b1111--------1bbbbbbbbbbbbbbbbbbbbbbbbbbbbb@",
          "---1b1-------------1b1111--------1bb11111111111111111111111b1111",
          "---1b1-------------1b1111--------1bb1---------------------1b1",
          "---1b1-------------1b1111--------1bb1---------------------1b1",
          "---1b1-------------1b1111--------1bb1---------------------1b1",
          "---1b1-------------1b1111--------1bb1---------------------1b1",
          "---1b1-------------1b1111--------1bb1---------------------1b1",
          "---1b1-------------1b1111--------1bb1---------------------1b1",
          "---1b111111111111111b11111111111-1bb1111111111111111111---1b1",
          "---1bbbbbbbbbbbbbbb1bbbbbbbbbbb1-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1111111111111111111111111b1-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------11111111111b1-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------1111bbbbbbbb1-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------1111b111b1111-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------1bbbb111bbb11-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------1b11b11111b11-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------1b11b11111b11-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------1111bbb111111-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------111111b11b111-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------111111b11b111-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------11b111bbbb111-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------11b111b111111-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------11bbbbb111111-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------1bb1111111111-1bbbbbbbbbbbbbbbbbbb11---1b1",
          "---1b1-------------1111----------1111111111111111111111---1b1",
          "---1b111111111111111111111111111111111111111111111111111111b1",
          "---1bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb1",
          "---1111111111111111111111111111111111111111111111111111111111",
        ]
      }
    }
  }
};