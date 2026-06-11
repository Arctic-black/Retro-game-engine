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
          ],
          setFlags: { metStranger: true }
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
            setFlags: { 
              gaveSteel: true, 
              hasSteel: true 
            }
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
          lines: [
            {
              condition: () => game.flags.askedBobAboutWorld === true,
              text: "Got some more questions about the world, do ya?"
            },
            {
              condition: () => game.flags.askedBobAboutBob === true,
              text: "Wanna know more about me?"
            },
            { 
              condition: function() {
                let result = game.flags.askedBobAboutWorld !== true && game.flags.askedBobAboutBob !== true;
                return result;
              },
              text: "Hi, dogamm bagpipes, I want chocolate!", 
            },
          ],
          options: [
            {
              condition: () => game.flags.metStranger,
              text: "Ask about stranger",
              next: "exampleScene.bobEncounter.bob.talkSpinninDude"
            },
            {
              condition: () => {
                return game.flags.hasSteel === true &&
                game.flags.talkedAboutSteel === true
              },
              text: "Offer steel",
              next: "exampleScene.bobEncounter.bob.getSteel"
            },
            {
              condition: () => game.flags.askedBobAboutWorld === true,
              text: "Tell me more about the world.",
              next: "exampleScene.bobEncounter.bob.worldExplain"
            },
             {
              condition: () => game.flags.askedBobAboutWorld === true,
              text: "No, I think I know enough about the world for now.",
              next: "exampleScene.bobEncounter.bob.response1"
            },
            {
              condition: () => game.flags.askedBobAboutBob === true,
              text: "Tell me more about Bob.",
              next: "exampleScene.bobEncounter.bob.bobBio"
            },
             {
              condition: () => game.flags.askedBobAboutBob === true,
              text: "No, I think I’m done with Bob for now.",
              next: "exampleScene.bobEncounter.bob.response1"
            },
            {
              condition: function() {
                let result = game.flags.askedBobAboutWorld !== true && game.flags.askedBobAboutBob !== true;
                return result;
              },
              text: "I want chocolate too!",
              next: "exampleScene.bobEncounter.bob.talkChoc"
            },

          ],
          setFlags: { metBob: true }
        },

        talkSpinninDude: {
          lines: [
            "You mean the spinning one over there?",
            "I've been wandering if it'll ever tire him",
            "Used to wait to see him drop down",
            "...but now I'm strating to think he's trying to start a whirlwind"
          ],
        },

        talkChoc: {
          lines: [
            "You wanna get some choclate?"
          ],
          options: [
            {
              text: "Yes, please!",
              next: "exampleScene.bobEncounter.bob.talkChoc2"
            },
            {
              text: "No, I lied",
              next: "exampleScene.bobEncounter.bob.response1"
            }
          ]
        },

        talkChoc2: {
          lines: [
            "Got any?",
            "Nah, you don't, chocolate isn't healthy for young cats",
            "Gwa, ha, ha ha.. (cough), HA!"
          ],
          options: []
        },

        response1: {
          lines: ["well, that's fair enough"],
          options: []
        },
        worldExplain: {
          lines: [
            "Hmm, where to start... I guess I would say the most important thing to know about this world is that it's full of objects. And dimensions. And stuff. And people. Important people. Like me! And lots of it all.",
            "Does that sound familiar to you?",
            "Why are you saying I said this before?",
            "I don't remember saying it before... ",
            "but I guess I might have said it before, who knows?",
            "Maybe you just have a good memory! Or maybe you just think I'm important enough to remember what I say exactly! ",
            "Either way, I'm flattered!"
          ],
          options: []
        },

        getSteel: {
          lines: [
            "Wow, you got me some steel?",
            "Hmm, tastes sooooooo good!",
            "What, did ya want any? I guess it to late for that!",
            "Gwa, ha, ha ha. . . HA!"
          ],
          setFlags: { hasSteel: false}
        },

        bobBio: {
          lines: ["I'm Bob."],
          options: [
            {
              text: "What kind of cat are you?",
              next: "exampleScene.bobEncounter.bob.bobBioDetail",
              condition: () => true
            },
            {
              text: "No more questions for now.",
              next: "exampleScene.bobEncounter.bob.response1",
              condition: () => true
            }
          ]
        },

        bobBioDetail: {
          lines: ["I'm a ginger cat."],
          options: [
            {
              text: "Ask about his hobbies.",
              next: "exampleScene.bobEncounter.bob.hobbies",
              condition: () => true
            },
            {
              text: "No more questions for now.",
              next: "exampleScene.bobEncounter.bob.response1",
              condition: () => true
            }
          ]
        },
            
        hobbies: {
          lines: ["I like to nap and eat and talk to strangers in video games."],
          options: [
            {
              text: "Ask about his favorite food.",
              next: "exampleScene.bobEncounter.bob.favoriteFood",
              condition: () => true
            },
            {
              text: "No more questions for now.",
              next: "exampleScene.bobEncounter.bob.response1",
              condition: () => true
            }
          ]
        },

        favoriteFood: {
          lines: ["I like to eat steel!"],
          options: [],
          setFlags: { talkedAboutSteel: true}
        }
      }
    }
  },

  //cutscene dialogue nodes
  bobCutscene: {
    bob: {
      opening: {
        lines: [
          "Bob is here!",
          "Hello there, my young apprentice!"
        ],
        options: [],
        next: null //next node
      },
      response1: {
        lines: ["I see you have some questions for me!"],
        options: [
          {
            text: "Ask about the world.",
            setFlags: { askedBobAboutWorld: true },
            next: "bobCutscene.bob.response2",
            condition: () => true
          },
          {
            text: "Ask about Bob.",
            setFlags: { askedBobAboutBob: true },
            next: "bobCutscene.bob.response3",
            condition: () => true
          }
        ]
      },

      response2: {
        lines: [
          "Well, in this world... there are objects.", 
          "And dimensions. And stuff. And people. Important people.", 
          "Like me! And lots of it all."],
        options: []
      },

      response3: {
        lines: ["Hi, I'm Bob. A cat."],
        options: []
      },

      response4: {
        lines: ["Well I ignore you too! That’s why I am talking to ya right now!"],
        options: []
      },

      response5: {
        lines: ["The guy standing in front of you, maybe?"],
        options: []
      },

    },

    player: { 
      response: {
        lines: [],
        options: [
          {
            text: "Hi Bob!",
            next: "bobCutscene.bob.response1",
            condition: () => true
          },
          {
            text: "Ignore Bob.",
            next: "bobCutscene.bob.response4",
            condition: () => true
          },
          {
            text: "Who's Bob?",
            next: "bobCutscene.bob.response5",
            condition: () => true
          }
        ],
      }
    }
  } 
};
