const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pixelart = {
    //category: {
    //  subject: {
    //    status: [
    //      {palette, map},
    //      {palette, map}, etc...
    //    ]
    //  }
    //} 
    sprites: {
        player: {
            idle_south: [
                {
                    palette: {
                        '-': 'transparent',
                        'a': 'rgb(0,0,0)',
                        'b': 'rgb(49,37,53)',
                        'c': 'rgb(86,88,103)',
                        'd': 'rgb(33,29,42)',
                        'e': 'rgb(63,63,78)',
                        'f': 'rgb(105,65,56)',
                        'g': 'rgb(75,43,50)',
                        'h': 'rgb(139,86,66)',
                        'i': 'rgb(164,100,75)',
                        'j': 'rgb(210,163,101)',
                        'k': 'rgb(187,135,83)',
                        'l': 'rgb(18,52,24)',
                        'm': 'rgb(88,177,73)',
                        'n': 'rgb(108,191,94)',
                        'o': 'rgb(206,251,167)',
                        'p': 'rgb(137,218,106)',
                        'q': 'rgb(183,242,142)',
                        'r': 'rgb(64,127,63)',
                        's': 'rgb(82,152,94)',
                        't': 'rgb(214,132,115)',
                        'u': 'rgb(44,116,36)',
                    },
                    map: [
                        '-----------------------------------------aaaa-------------------aaaa--------------------------------------------',
                        '-----------------------------------------abcdaaa--aaaaaaaaaa--aadcba--------------------------------------------',
                        '-----------------------------------------abbccaaaabbbbbbbbbbaaaecbba--------------------------------------------',
                        '-----------------------------------------abfbccbdbbgfffffgbbddccbfba--------------------------------------------',
                        '-----------------------------------------abhfbcebbfffffffffgbecefhba--------------------------------------------',
                        '-----------------------------------------abiigeeegfffffffffgeeegiiba--------------------------------------------',
                        '-----------------------------------------abiihbegfffffffffffgebhiiba--------------------------------------------',
                        '-----------------------------------------abiifbgfffffffffffffgbhiiba-----aaaaa----------------------------------',
                        '-----------------------------------------abifbbfffffffffffffffbbfiba----aaeeeda---------------------------------',
                        '-----------------------------------------abfbbfffffffffffffffffbbfda----aecccea---------------------------------',
                        '-----------------------------------------abbbfffffijjjjjjkfffffgbbda---abccceda---------------------------------',
                        '----------------------------------------abbbffffkkjjhfffijjkfffggbbda--accceda----------------------------------',
                        '---------------------------------------abbbbffikkhaaaaaaaaikkiffggbbba-acceda-----------------------------------',
                        '---------------------------------------abbbbfiihaaddddddddaahiifggbbba-accea------------------------------------',
                        '--------------------------------------aabbbfiiaaddddddddddddaahhhfbbbaaaceda------------------------------------',
                        '-----------------------------------aaaabbbfhfaddddeeeeeeedddddaahfgbbbaacea-------------------------------------',
                        '----------------------------------adkhabbbhhadddccceeeeeeecccdddaffbbbdaeea-------------------------------------',
                        '----------------------------------aijhgabhhaadllllcceeeeeccllllbaaffbbdaeea-------------------------------------',
                        '---------------------------------afjhggaafaaddmnlllceeeeeclllnmddaafbbdaeda-------------------------------------',
                        '---------------------------------ajhfaggafaaddmollmleeeeelmllomddaaffbaaeda-------------------------------------',
                        '---------------------------------ajfaahgafaabepqllpleeeeelpllqqedaaffbaaeda-------------------------------------',
                        '---------------------------------afgaghgagbaabrqqqqeeccceeqqqqrbaaafbaaddda-------------------------------------',
                        '----------------------------------agghgaaafdaeccssccciticccsscccbafgaaadda--------------------------------------',
                        '----------------------------------aafhga-aafbaabeeeeccdccccecedaagfaa-adda--------------------------------------',
                        '-----------------------------------ahga---aafgaaddbbdddddbbddaaggba--addda--------------------------------------',
                        '-----------------------------------agggaaabbagfgaaadddddddaaagfgaddaaadda---------------------------------------',
                        '------------------------------------ahfafffgbaaghhfaaaaaaagfhgaabbgdaddda---------------------------------------',
                        '------------------------------------ahgaaiffgbdaafihaaaaafhgaadbgfffgada----------------------------------------',
                        '-----------------------------------aaggaafkfgbabbaaiarnrahaabbabgfkkifa-----------------------------------------',
                        '-----------------------------------abccabakfbbabbbdgdmqmdgdbbbabfkaaafa-----------------------------------------',
                        '-----------------------------------abbbabahbbbabbgffdbmddgfbbbaggabbdaa-----------------------------------------',
                        '-----------------------------------adccdaafbaabbgfhabbeeeahggbbaadccea------------------------------------------',
                        '-----------------------------------adddgaafbabbgffkabeeebaiffgbbabccea------------------------------------------',
                        '------------------------------------aaggaagaabgffkdbgkjkgbdkffgbabdcdaa-----------------------------------------',
                        '-------------------------------------aggaaaabbgffkdbbiiigbdkfffgbaddafa-----------------------------------------',
                        '-------------------------------------ahgababbgffikadddddddakiffggaaadfga----------------------------------------',
                        '-------------------------------------ahfababggffkaddeeeeeddakfffggaadfga----------------------------------------',
                        '-------------------------------------aghaaaafffkaadddddddddaakfffdaaafga----------------------------------------',
                        '--------------------------------------aha--aadikaddaaaaaaaddakhgaa--afa-----------------------------------------',
                        '--------------------------------------ahga---aaaadda-----addaaaa-----aa-----------------------------------------',
                        '--------------------------------------ahga--adeeedda-----addbeeda-----------------------------------------------',
                        '--------------------------------------ahga--abcbcba-------adcbcda-----------------------------------------------',
                        '--------------------------------------agga---aaaaa---------aaaaa------------------------------------------------',
                        '---------------------------------------aa-----------------------------------------------------------------------',
                    ]
                }
            ]
        }
    }
};


// ----- Loading system ----- \\

const loadPix = {
  curLoad: [0, 0, 0, 0, 0], // [categoryIdx, subjectIdx, statusIdx, frameIdx, row]
  stepIndex: 0,
  stepMax: 4000,
  tempCanvas: null,
  tempCtx: null,
  pixelFrame: null,
  isLoading: false,

  // Start loading a specific frame
  initiate: function (path) {
    this.isLoading = true;
    this.curLoad[4] = 0; // reset row counter
    this.stepIndex = 0;
    this.pixSize = 1;
    this.path = path;

    // Get the actual frame object
    this.pixelFrame = this.getFrame(path);

    if (
      !this.pixelFrame ||
      !this.pixelFrame.map ||
      this.pixelFrame.map.length === 0
    ) {
      console.error('Invalid pixel frame for path:', path);
      this.isLoading = false;
      return;
    }

    const height = this.pixelFrame.map.length * this.pixSize;
    const width = this.pixelFrame.map[0].length * this.pixSize;

    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
    this.tempCtx = this.tempCanvas.getContext('2d');
  },

  getFrame: function (path) {
    // path example: ['sprites', 'player', 'body', 0]
    let obj = pixelart;
    for (let key of path) {
      obj = obj[key];
      if (obj === undefined) return null;
    }
    return obj; // should be the {palette, map} object
  },

  render: function () {
    //if (!this.pixelFrame || !this.tempCtx) return;
    const pixSize = this.pixSize;
    const map = this.pixelFrame.map;
    if (this.curLoad[4] >= map.length) return;

    this.rowlen = map[this.curLoad[4]].length;
    const step = Math.floor(this.stepMax / this.rowlen);

    const startRow = this.curLoad[4];
    let endRow = startRow + step;

    if (endRow > map.length) endRow = map.length;

    const palette = this.pixelFrame.palette;

    for (let i = startRow; i < endRow; i++) {
      const row = map[i];
      for (let j = 0; j < row.length; j++) {
        const char = row[j];
        if (char === '-') {
          this.tempCtx.fillStyle = 'transparent';
        } else {
          this.tempCtx.fillStyle = palette[char] || '#000000';
        }
        this.tempCtx.fillRect(j * pixSize, i * pixSize, pixSize, pixSize);
      }
    }

    // Update current row position
    this.curLoad[4] = endRow;

    if (this.curLoad[4] >= map.length) {
      console.log('why??');
      this.stepIndex = 0;
      const path = this.path;
      pixelart[path[0]][path[1]][path[2]][path[3]] = this.tempCanvas;
      //this.isLoading = false;
    }
  },

  renderLoop: function () {
    return this.curLoad[4] < this.pixelFrame.map.length;
  },

  getImage: function () {
    return this.tempCanvas;
  },
};

//====== Loading queue ======
const toLoad = [
  ['sprites', 'player', 'idle_south', 0],
];

let loadIndex = 0;

//====== Main loop ======
function loading() {
  if (loadIndex >= toLoad.length) return;

  const currentPath = toLoad[loadIndex];

  if (!loadPix.isLoading) {
    loadPix.initiate(currentPath);
  }

  if (loadPix.renderLoop()) {
    loadPix.render();
    ctx.drawImage(loadPix.getImage(), 0, 0);
  } else {
    // finished current asset
    loadIndex++; // move to next asset
    loadPix.isLoading = false; // ready for next initiate

    if(loadIndex >= toLoad.length) {
      app.scene = 'game'; // switch to game scene
    }
  }
}


const app = {
    scene: 'loading',
    runGame: function() {
        // Game logic here
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(pixelart.sprites.player.idle_south[0], 100, 100);
    },
    run: function() {
        switch (this.scene) {
            case 'loading':
                loading();
                break;
            case 'game':
                this.runGame();
        }
    }
}

function animate() {
  requestAnimationFrame(animate);
  app.run();
}

animate();