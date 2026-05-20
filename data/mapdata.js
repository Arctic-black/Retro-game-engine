const tiles = {
  defualt: {
    a: ['tiles', 'floor_wood', 0],
    b: ['tiles', 'grass', 0],
    c: ['tiles', 'portal', 0],
  }
};

let mapdata = {
  map: {
    room: {
      'test': {
        tileSet: tiles.defualt,
        portals: {'@': { dest: 'test2', tile: 'c', direction: 'east'}},
        map: [
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "bbbbbbbbbbbb@bbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
          "aaaaaaaaaaaaabbbbbb",
        ]
      },
      'test2': {
        tileSet: tiles.defualt,
        portals: {'@': { dest: 'test', tile: 'b', direction: 'west'}},
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