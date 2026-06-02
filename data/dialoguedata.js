const dialogueData = {
    //scene:
      //encouter:
        //speaker:
          //dialogue: [
          //'tekst' ||
          // {option: 'choice', next: 'scene.encounter.speaker.dialogue[0]'},
          // {option: 'another choice', next: 'scene.encounter.speaker.dialogue[1]'},
          // ...
          //]A drg path, etched in the surface. As evidence. I left there on purpose. 
    exampleScene: {
        exampleEncounter: {
            exampleSpeaker: {
                dialogue: [
                    ['Hello, there!','How are you doing?'],
                    {option: 'Fine', next: 'exampleScene.exampleEncounter.exampleSpeaker.dialogue[4]'},
                    {option: 'Ignore', next: 'exampleScene.exampleEncounter.exampleSpeaker.dialogue[5]'},
                    {option: 'Not great', next: 'exampleScene.exampleEncounter.exampleSpeaker.dialogue2[0]'},
                    ['Me too!', 'Nice to meet you!'],
                    ['You ignored the speaker.']
                ],
                dialogue2: [
                    ['How come?'],
                    {option: 'Saw you.', next: 'exampleScene.exampleEncounter.exampleSpeaker.dialogue2[2]'},
                    ['That\'s confronting............', 'Let\'s change the subject.'],
                    {option: 'I ate steel.', next: 'exampleScene.exampleEncounter.exampleSpeaker.dialogue2[4]'},
                    ['You ate steel? That sounds painful!', 'Maybe you should see a doctor.'],                 
                ] 
                
            }
        }
    }
}
