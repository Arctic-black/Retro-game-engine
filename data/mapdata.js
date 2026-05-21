const tiles = {
  defualt: {
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
        tileSet: tiles.defualt,
        portals: {'@': { dest: 'test2', tile: 'c', direction: 'east'}},
        hitbox: {'1': {tile: 'd', solid: true}},
        map: [
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaa11bbbbb",
          "bbbbbbbbbbbb@1bbbbb",
          "aaaaaaaaaaaa11bbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaa111aaabbbbbb",
          "aaaaaaaaa11aabbbbbb",
          "aaaaaaaaaa1aabbbbbb",
        ]
      },
      'test2': {
        tileSet: tiles.defualt,
        portals: {'@': { dest: 'test', tile: 'b', direction: 'west'}},
        hitbox: {'1': {tile: 'd', solid: true}},
        map: [
          "1111aaaaaaaaabbbbbb",
          "@bbbbbaaaaaaabbbbbb",
          "1111abbbbbaaabbbbbb",
          "aaaaaaaaabaaabbbbbb",
          "aaaaaaaaabaaabbbbbb",
          "aaaaaaaaabaaabbbbbb",
          "bbbbbbbbbbbbbbbbbbb",
          "aaaaaaaaabaaabbbbbb",
          "aaaabbbbbbbbabbbbbb",
          "aaabbaaaaaababbbbbb",
          "aabbaaaaaaabbbbbbbb",
          "aabaaaaaaaaaabbbbbb",
        ]
      }
    }
  }
};