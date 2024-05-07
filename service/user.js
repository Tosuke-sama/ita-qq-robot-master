const axios = require("axios");
const request = require("request");
const mlyai = require('./chat/mlyai.js')
const {segment} = require("oicq")
const Auth = require("./auth");
const Utils = require("./utils");
const messagePrivateConfig = [
    {
        keywords: ['秘密'],
        reply: [],
        callback: function (data, bot) {
            return new Promise((resolve, reject) => {
                let replyMsg = [
                    '其实最开始的Tocode团队有五位成员',
                    '智能物联协会一开始筹办时被指导罗老师大笔一挥命名为物联协会，京介询问道这样是否没有考虑同系的智能科学与技术专业的同学们？罗老沉思，遂添加智能二字。',
                    '协会是宜宾校区唯一一个在本部建立的原创协会',
                    '唔，让殿下想想。。',
                    '京介技术很菜，希望大家多带带他。',
                    '协会里20级的张子阳，勾启錞，马英杰，叶俊杰，吴润泽等都是后端大佬，有不会可以咨询他们。',
                    '协会里的成员大多都是搞算法竞赛的，但ITA原本是搞物联网的',
                    '协会的建立没有学长学姐的沉淀与帮助，做的不够好的地方还请多多谅解喔！',
                    '想学习前端的话可以叫上京介一起',
                    '京介曾想把协会教室改装成KTV，不过立即被阻止了',
                    '京介的英文称呼是Tosuke，所以也可以叫他托斯克',
                    '叶俊杰表面是正人君子，实际上是中毒最深的老二次元',
                    '雷雨以前是带眼睛的文人，后来去动了手术，变得十分粗狂',
                    '公主可以帮你翻译喔，只需要发送翻译加文本就好',
                ].randomOne()
                resolve(replyMsg)
            })
        }
    },
    {
        handle_type: 'default',
        reply: [],
        callback: function (data, bot) {
            return new Promise(resolve => {
                let userId = data.sender.user_id
                let msgList = data.message
                for (let msg of msgList) {
                    if (msg.type === 'text') {
                        let playLoad = mlyai.getPlayLoad(1, msg, data);
                        console.log(playLoad)
                        mlyai.chat(playLoad).then(replies => {
                            resolve(Utils.convertToElems(replies, Auth.isUserVoiceOpen(userId)))
                        })
                        return
                    }
                }
            })
        }
    }
]

module.exports = messagePrivateConfig

