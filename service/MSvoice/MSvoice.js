const {segment} = require("oicq");
 function synthesizeSpeech(text) {
    let fs=require('fs');
    var sdk = require("microsoft-cognitiveservices-speech-sdk");
    const { resolve } = require("path");    
    var key = "09edca1dba064686b8786f873292a725";
    var region = "eastus";
    var audioFile = "test1.wav";

    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

    // The language of the voice that speaks.
    speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoyiNeural"; 
    // Create the speech synthesizer.
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

      // Start the synthesizer and wait for a result.
      synthesizer.speakTextAsync(text,
        result => {
            synthesizer.close();
            // convert arrayBuffer to stream
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted){
                console.log("voicedown")
                let url = segment.record('test1.wav');
                console.log(url);
            }
        },
        error => {
            console.log(error);
            synthesizer.close();
        })
    //  function (result) {
    //     if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
    //       console.log("synthesis finished.");
    //     } else {
    //       console.error("Speech synthesis canceled, " + result.errorDetails +
    //           "\nDid you set the speech resource key and region values?");
    //     }
    //     synthesizer.close();
    //     synthesizer = null;
    //   },
    //       function (err) {
    //     console.trace("err - " + err);
    //     synthesizer.close();
    //     synthesizer = null;
    //   });
      console.log("Now synthesizing to: " + audioFile);
    }
module.exports = {synthesizeSpeech}

