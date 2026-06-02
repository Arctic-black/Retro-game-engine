const dialogueData = {
  exampleScene: {
    exampleEncounter: {
      exampleSpeaker: {
        greet: {         
          lines: [
            {
              text: "... The speaker seems to have nothing to say to you.",
              next: "exampleScene.exampleEncounter.exampleSpeaker.ignore",
              //directing the dialogue to a new node so that we skip other lines
              condition: () => game.flags.ignoredOnConversation === true
            },
            { 
              text: "Hello there!",
              condition: () => game.flags.ignoredOnConversation !== true
            },
            "How are you doing today?",
            {
              text: "You look stronger than last time.",
              condition: () => game.flags.metSpeakerBefore === true
            },
            {
              text: "You're bleeding... are you okay?",
              condition: () => app.player.health < 40
            }
          ],
          options: [
            { 
              text: "Fine, thanks.", 
              next: "exampleScene.exampleEncounter.exampleSpeaker.positive",
              condition: () => true
            },
            { 
              text: "Not great...", 
              next: "exampleScene.exampleEncounter.exampleSpeaker.negative",
              condition: () => true
            },
            { 
              text: "Ignore him.", 
              next: "exampleScene.exampleEncounter.exampleSpeaker.ignore",
              condition: () => game.flags.metSpeakerBefore === true
            },
            {
              text: "Ask about Bob.",
              next: "exampleScene.exampleEncounter.exampleSpeaker.aboutBob",
              condition: () => game.flags.metBob === true
            }
          ]
        },
        
        positive: {
          lines: [
            "Glad to hear it!", 
            {
              text: "Can I offer you some steel?",
              condition: () => game.flags.gaveSteel === false
            },
          ],
          options: [ 
            {
              text: "Yes, please!",
              next: "exampleScene.exampleEncounter.exampleSpeaker.giveSteel",
              condition: () => game.flags.gaveSteel === false
            }
          ],
          setFlags: { metSpeakerBefore: true }  // Example of setting a flag when this node is reached
        },
        
        negative: {
          lines: ["Oh? What's wrong?"],
          condition: null,   // whole node can be conditional
          options: [ 
            {
              text: "Saw you.",
              next: "exampleScene.exampleEncounter.exampleSpeaker.react1",
              condition: () => true
            },
            {
              text: "Ate steel.",
              next: "exampleScene.exampleEncounter.exampleSpeaker.react2",
              condition: () => game.flags.gaveSteel === true
            },
            {
              text: "Ignore.",
              next: "exampleScene.exampleEncounter.exampleSpeaker.ignore",
              condition: null,
              setFlags: { ignoredOnConversation: true }
            }
          ]
        },
        
        ignore: {
          lines: ["The speaker looks disappointed..."],
          setFlags: { 
            metSpeakerBefore: true,
            ignoredSpeaker: true 
          },
        },

        aboutBob: {
          lines: ["Oh, you know Bob? He's a great guy!"],
          options: []
        },

        giveSteel: {
            lines: ["Here's some steel for you!"],
            options: [],
            setFlags: { gaveSteel: true }
        },

        react1: {
          lines: ["That's unfortunate. And a little concerning........", ".......", "let's change the subject."],
          options: []
        },

        react2: {
          lines: ["Oh, you already ate some? That's good!", "I mean naturally everbody eats whatever a stanger you just met gave them, right?"],
          options: []
        }
      }
    },
    bobEncounter: {
      bob: {
        greet: {
          lines: ["Hi, I'm Bob!"],
          options: [],
          setFlags: { metBob: true }
        }
      }
    }
  }
};