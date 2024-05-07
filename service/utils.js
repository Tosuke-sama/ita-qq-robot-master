const {segment} = require("oicq");
const mlyai = require("./chat/mlyai");
const MSvoice= require("./MSvoice/MSvoice")

function getYoudaoVoiceUrl(text) {
    return 'https://tts.youdao.com/fanyivoice?le=zh&keyfrom=speaker-target&word=' + text
}

function convertToElems(msgs, isVoiceOpen) {
    let res = []
    msgs.forEach(item => {
        new Promise((resolve,reject)=>{
            
            resolve();
        }).then(()=>{
             if (item.typed === 1) {
            if (isVoiceOpen && item.content.length < 30) {
                MSvoice.synthesizeSpeech(item.content);//修改音频文件
                let url = segment.record('test1.wav');
                res.push(url)
            } else {
                res.push(item.content)
            }
        } else if (item.typed === 2) {
            res.push(segment.image(mlyai.getAbsoluteUrl(item.content)))
        } else if (item.typed === 4) {
            res.push(segment.record(mlyai.getAbsoluteUrl(item.content)))
        }
        })
       
    })
    return res
}

function getMsgItemByType(msgList, type) {
    for (let item of msgList) {
        if (item.type === type) {
            return item
        }
    }

    return undefined
}

module.exports = {convertToElems, getMsgItemByType}
