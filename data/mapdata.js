const tiles = {
  defualt: {
    a: ['tiles', 'floor_wood', 0],
    b: ['tiles', 'grass', 0]  
  }
};

let mapdata = {
  map: {
    room: {
      'test': {
        tileSet: tiles.defualt,
        portals: {'@': { dest: 'test2', tile: 'b'}},
        map: [
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "bbbbbbbbbbbbbbbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbb@",
          "aaaaaaaaaaaaabbbbbb",
        ]
      },
      'test2': {
        tileSet: tiles.defualt,
        portals: {'@': { dest: 'test', tile: 'b'}},
        map: [
          "bbaaaaaaaaaaabbbbbb",
          "@bbbbbaaaaaaabbbbbb",
          "aaaaabbbbbaaabbbbbb",
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