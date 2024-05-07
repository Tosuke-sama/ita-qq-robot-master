const mlyai = require("../service/chat/mlyai.js");
const Auth = require("../service/auth.js");
const fs = require("fs");
const {segment} = require("oicq");
 function synthesizeSpeech(data) {
    // let msgList = data.message
    // for (let msg of msgList) {
    //     if (msg.type === 'text') {
    //         //设置ai标头
    //         var playLoad = mlyai.getPlayLoad(2, msg, data);
    //         //回调处理回复
    //         mlyai.chat(playLoad).then(replies => {
    //             replies.forEach(item => {
    //                 items=item;
    //                 text = item.content.toString();
    //                 console.log(typeof(text));
    //                 console.log(text);
    //             })   
    //         })
    //     }
    // }
    return new Promise((resolve,reject)=>{       
        var sdk = require("microsoft-cognitiveservices-speech-sdk");
        var readline = require("readline");
        var key = "09edca1dba064686b8786f873292a725";
        var region = "eastus";
        var audioFile = "test.mp3";
        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);
        speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoyiNeural"; 
        var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        // let items;
        // let text="你好";
        // let msgList = data.message
        // for (let msg of msgList) {
        //     if (msg.type === 'text') {
        //         //设置ai标头
        //         var playLoad = mlyai.getPlayLoad(2, msg, data);
        //         //ai回调处理回复
        //         mlyai.chat(playLoad).then(replies => {
        //             replies.forEach(function(item){
        //                 items=item;
        //                 text = item.content+"";
        //                 console.log(text);
                        synthesizer.speakTextAsync(data,
                            function (result) {
                          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            console.log("语音转换完毕");
                            resolve()
                          } else {
                            console.error("Speech synthesis canceled, " + result.errorDetails +
                                "\nDid you set the speech resource key and region values?");
                          }
                          synthesizer.close();
                          synthesizer = null;
                        },
                           function (err) {
                        //   console.trace("err - " + err);
                          synthesizer.close();
                          synthesizer = null;
                          reject();
                        });
                    // })   
        //         })
        //     }
        // }
        
      console.log("Now synthesizing to: " + audioFile);
        
    }).then(()=>{
        console.log("处理语音消息发送")
        let res = [];
        //Auth.isUserVoiceOpen(userId)
        if (true) {
            let url = segment.record("F://前端项目/lec-qq-robot-master/lec-qq-robot-master/test.mp3",false);
            //删除多余音频文件
            // fs.unlink("F://前端项目/lec-qq-robot-master/lec-qq-robot-master/test.amr",function(error){
            //     if(error){
            //         console.log(error)
            //         return false;
            //     }
            //     console.log('删除文件成功');
            // })
            console.log(url);
            res.push(url);
        } else {
            res.push(item.content)
        }
        return res;
        // let msgList = data.message
        // for (let msg of msgList) {
        //     if (msg.type === 'text') {
        //         let playLoad = mlyai.getPlayLoad(2, msg, data);
        //         mlyai.chat(playLoad).then(replies => {
        //             if(Auth.isUserVoiceOpen(userId)==true){
        //                 replies.forEach(item => {
        //                     MSvoice.synthesizeSpeech(item.content);
        //                 })
        //             }
        //             resolve(Utils.convertToElems(replies, Auth.isUserVoiceOpen(userId)))//
        //         })
        //         return
        //     }
        // }

    })
    
    }
module.exports = {synthesizeSpeech}

