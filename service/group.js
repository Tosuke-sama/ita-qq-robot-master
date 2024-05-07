// 群发配置
const axios = require("axios");
const request = require("request");
const mlyai = require('./chat/mlyai.js')
const {segment} = require("oicq")
const Auth = require("./auth");
const Utils = require("./utils");
const MSvoice = require("./MSvoice/MSvoice.js")
const audio = require("../lib/audio.js")
const fs = require('fs')
var lock = 0;

const messageGroupConfig = [
    // 
    {
        keywords: ['开启语音'],
        callback: (data, bot) => {
            return new Promise(resolve => {
                if (!Auth.isGlobalVoiceOpen()) {
                    resolve('管理员未开启语音模式')
                    return
                }
                let userId = data.sender.user_id
                if (Auth.isUserVoiceOpen(userId)) {
                    resolve('已经在语音模式中了哦~')
                } else {
                    Auth.setUserChatState(userId, 'lc')
                    Auth.setUserVoiceState(userId, 'lc')
                    resolve('开启语音模式成功~')
                }
            })
        }
    },
    {
        keywords: ['关闭语音'],
        callback: (data, bot) => {
            return new Promise(resolve => {
                let userId = data.sender.user_id
                if (!Auth.isUserVoiceOpen(userId)) {
                    resolve("已经关闭了哦")
                } else {
                    Auth.setUserVoiceState(userId)
                    resolve("关闭语音模式成功~")
                }
            })
        }
    },
    {
        keywords: ['历史上今天', '历史上的今天', '历史今天', '历史的今天'],
        callback: (data, bot) => {
            return new Promise(resolve => {
                axios.get('https://api.asilu.com/today').then(res => {
                    if (res.data.code !== 200) {
                        console.error(`历史上的今天接口出错了 | ${res.data}`)
                        resolve('休息一下吧')
                        return
                    }
                    let msgList = [`${new Date().toLocaleDateString()}`]
                    res.data.data.forEach(e => {
                        if (e.year >= 0) {
                            msgList.push(`${e.year}年: ${e.title}`)
                        } else {
                            msgList.push(`公元前${Math.abs(e.year)}年: ${e.title}`)
                        }
                    })
                    resolve(msgList.join('\n\n'))
                }).catch(e => {
                    console.error(`历史上的今天接口出错了 | ${e.message}`)
                    resolve('休息一下吧')
                })
            })
        }
    },
    {
        keywords: ['set'],
        callback: (data, bot) => {
            return new Promise(resolve => {
                let userId = data.sender.user_id
                if (!Auth.isAdmin(userId)) {
                    resolve('没有权限哩!')
                    return
                }
                let msg = Utils.getMsgItemByType(data.message, 'text')
                    .data.text.replaceAll('  ', ' ').trim()

                // match
                const pattern = /^set [a-zA-z]+ \d+/
                if (!pattern.test(msg)) {
                    resolve('指令格式错误')
                    return;
                }
                let args = msg.split(' ')
                if (!['chat', 'voice'].includes(args[1])) {
                    resolve('设置错误, 没有该项')
                    return
                } else {
                    Auth.setGlobalState(args[1], args[2])
                }
                resolve(`设置${args[1]}成功!`)
            })
        }
    },
    {
        keywords:["新闻","每日新闻","今天的新闻"],
        callback:function(data,bot){
            return new Promise(resolve=>{
                axios.get('http://bjb.yunwj.top/php/qq.php').then(res => {
                    if (res.data.nr !== "内容请求成功") {
                        console.error(`新闻接口出错了 | ${res.data}`)
                        resolve('休息一下吧')
                        return
                    }
                    let url = segment.image(res.data.tp,false)
                    let msglist=[url];
                    var num=0;
                    res.data.wb.split("【换行】").forEach(e=>{
                        if(num==0){
                            num++;
                        }
                        else
                        msglist.push(e+'\n\n')
                    })
                    console.log(url)
                    resolve(msglist)
                }).catch(e => {
                    console.error(`历史上的今天接口出错了 | ${e.message}`)
                    resolve('休息一下吧')
                })
            })   
        }
    },
    {
        keywords:["点赞","给我点赞","赞我"],
        callback:function(data,bot){
            return new Promise(resolve=>{
                console.log(data.sender.user_id)
                bot.sendLike(data.sender.user_id, 10);
                let msg=`公主已经给${data.sender.nickname}点赞啦！`
                resolve(msg);
            })
        }
        
    },
    {   // 这个一定要放在最后面，之前所有关键字均为命中则进入本项
        handle_type: 'default',
        callback: function (data, bot) {
            let userId = data.sender.user_id
            console.log(data.message)
            // 没有开启聊天模式
            // if (!Auth.isUserChatOpen(userId)) {
            //     return new Promise((resolve, reject) => {
            //         let replyMsg = ['(oωo)喵?', '干嘛?', '怎么了?', '在的', '嗯哼?', '@我干嘛?', '[CQ:face,id=307,text=/喵喵]', '2333~', '咕-咕-咕-',
            //             '有时候和我聊天的人太多了,我只能选择回复一部分', '虽然还不知道你想要说什么,但我还是得提醒一下有个东西叫百度', '嗨嗨害', '哪里又需要我了？', '怎么,是打算V我50了吗？',
            //             '(。w。)', '如果有什么建议，可以反馈给我的开发者们', 
            //             '[CQ:image,file=6649921a0baed198cdc6c3661256f1c52589447-4032-3024.jpg,url=https://c2cpicdw.qpic.cn/offpic_new/3403290479//3403290479-3675439703-6649921A0BAED198CDC6C3661256F1C5/0?term=2]',
            //             '不懂，我是人工智障'
            //         ].randomOne()
            //         resolve(replyMsg)
            //     })
            // 
            // 开启聊天模式
            //老api
            // return new Promise(resolve => {
            //     let msgList = data.message
            //     for (let msg of msgList) {
            //         if (msg.type === 'text') {
            //             let playLoad = mlyai.getPlayLoad(2, msg, data);
            //             console.log(playLoad)
            //             mlyai.chat(playLoad).then(replies => {
            //                 // if(Auth.isUserVoiceOpen(userId)==true){
            //                 //     replies.forEach(item => {
            //                 //         MSvoice.synthesizeSpeech(item.content);
            //                 //     })
            //                 // }
            //                 if(Auth.isUserVoiceOpen(userId))//if先不看
            //                 resolve(audio.synthesizeSpeech(data));
            //                 else
            //                 resolve(Utils.convertToElems(replies, Auth.isUserVoiceOpen(userId)))
            //             })
            //             return
            //         }
            //     }
            // })
            //chatgtp
            return new Promise(resolve => {
                
                // var data1 = JSON.stringify({
                //    "msg": data.msg,
                //    "sessionToken": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..zz65HcynXRdQuE8_.hl4PsUSrNpDVdE8udnweL3glVwXAZGwrWqwMVilKmuYe6vUy2bmPQOFnS5JPlcfXINNRorKQixVPTPB4obPe8Jl2QRHS5uFI5G_VlzPT8Uyf9MtVFX-SNNF--f-gUESNqLDCJSsUJhBCyRe5jkGjb5d0lqtLprShJ6QhcmzX3zXBu_BANIlJJvJX-3mzWWeEh3Of0nayZKDv6SD8IPw-eSXWU8bn-v4eEEm1wS4iz7_7gmm_Hm2hPXOlg0SiQ3tfNGCFigBBvtAjSEa2FpblkTBAGtef6U-6DMJFzZ5YmEtYeeipJSxtjE_CeWUVuXwfio_gKa961Rkv_VaGAsrWdndzPKcHKMNqzi73tXmPbCsAJm3B9-dqzXAAZHu8amtq4nElu_L6jQDdDmxJ0Vr5zWw7e9Jp9HpM7-qXSJNfKjwnCr6NMkozreK6i1FEiM1CjyulT-IVf6OInxVMOCTWN9Ivqhsf6tFbETkIho2x-pGPIouFcyMKqf6RRbmyteDdOXCczLPmzP_17yWRTebklhxglaD_gkTtOpSZq9W3UqLVsBT2oDV8gk3hJGa8c96lbFJNKpeT8pmV84faojdhZQB2AMUAtr7JiTQHtA5S0iMiJ2_6v9JE8ezejmYtkWsTY3wW5122uOlvFA8rbU-d7sCse--p3-0VTUfwlSLxzLx-z2_YGyEWkyVON-yz4sFoxAfjURT5ZTC9_7DaclKTL-3TNGv4iSXDqmISi8ng1XSEEhdSoq8opMsLy3iOqiD2WWNuFBO7UTNZUOJzAZ4djYhrzE0e0RPpsr-w07T0Ysc-XzuQLvEEvS1ZqEXP9Nzh6n5lRNqXeRfBrIDFY8bZvEnFXr2fcTEeyF9vX526nu1B09b7kOfr9bfpMWJpbV4eMyfFrUzTaj8gPeWGMZrV9-7MN1IvlNU825SNIkMsmnDSfxbWFKRdY7p4TsxHuElKf60gMiAiiBWzV40RScdZXCVNZfC4aHoz61M9cWFiAc0YYQ3nDUc_On93I9j17WW9-sF5I8CMtx0tNgFJhxF5vZc1kVX5Ue64zR-DZMon3VyJHTz77uSWrLYgzBAnPUMYRkpWOzxSIf5x_-9uZzO9xgfy_3XgkmjCu6jAYRylDTtaESHdS4dOOO7WEQtrwaoBZJvHJ7bKmmKRPXoX8ao02-YTLTM6Cnh7zoCqjFSyNuGHU12z21tfdQOXrrtx8fN9oC_1ssXNWLq1OZcNqLZCRLWyemD_7-ix-n7d8VNfrnKpEONeKJt1yOnHCxYfdK4RIIRmuKwcIpuTbRNCoHbS8o1X_0OUla_iZJt1MQ4D_XKaYfhmw_lqxFPhrZ-TC1Wi9qxm215BngqSOB93WnxwdTJMvM73PNVIra6faBSl52kJ3F8oFZltf3dDA9_Xn70koHFBaaruDsAqJtT1y6EL5hoai85pxwJ0wIGAcAazyrWMaZNvCILLhk8Khq1dWlIUiXAof9Ger1qcNDW_SscOSCD1mlYTfCxoAOU6cusVjHlAsYn0FKBhhcKM3u_tSYqvJclGC9fgKFsKtXyY_X0EjVohXT5o5uir5KHZYNbPd6D84uc-7yhz8JjyD8oWUu0KriaKRrpmLA2g3aAGdiMYLISjjTpVmf8v_LnOJVwEjq6ZCJrHG4rI7B7BtZvwVvl6SuyOBFf-0RWM7ucdv0tMWlL215X3LxrvcvgryzRTTVcLm-kfUkjBxcuLKykmVQonqUzLlLJOkm57K10tdXi39_WJYfVNQdD_b8DjvfkEd6-RrmOKORBHorMYZBaeoK07s0TB0wVAT9tjKRswM6DvbTuD1v1gDMqmOh537HFuTLmbSbR6AZONznCDbUHqRp0-VqTMTQ1YipQKBveEnzxppH9wCn7qbzA-fhGQF744vMVP_ODB3wtxj0_uXffwt6dPl7AjoDa7mVvNFyUtTVDnRnS2wf2Rg8rCclPmTvQXs2O9-svE7i86zeKBUeWMKpS-KbgANlsLV6edrohEmF3fjNeV1Jxl8H2iCTBx0royE7sJkVEG5pM5q_ZCZqbCFvcpQrUFlv3WGBK2geYgIqv-5NBK-Zp7Nm1OzHGSJXIxlpRGkZIQjs_NRKHYIi21bB9-Ax-0_mT4KLtTLY2klurC8lymeui7MgnT3SK9e5p-nqC1oX0P6s3X7oSx1fJSLBsrG-i8Y-oqyHTRyOA839gP3uLx5Tq3Exv6u0hGpfL_qsAKuJQ9QxdDYQUj3bX9xMNT7zM1WuoHr3vNaBW6PfN-TXZnT6O2O6ssfqeUhVOw6N4QrMKawsfPeBVfnIoTiYhNazf0AbDjD6p-3RtuQ_doHKqtVzrHn-S82CRbkTJwmCHVbh34DbzXnLKsYxz2p12I6AYK3hNLsH5pAZoejQA4GkHG4eNLx0hT8YR64XsMMnBqhUp9qbzrGMmaEj9SWWxfySgHyKuze77aWPNDoJhFGcKY41Yx3ijcKC-KSno8A3n-B_AuxRUirDiojgtF6HxZdeof4FgBvxfzKCjrUkDi-3X4m8_OqF7tgcBomSfs4g.gBVJl11fAOI-fgiLlIR2Kg"
                // });
                
                // var config = {
                //    method: 'post',
                //    url: '127.0.0.1:1024/sendMsg',
                //    headers: { 
                //       'Content-Type': 'application/json'
                //    },
                //    data : data1
                // };
                
                // axios(config)
                // .then(function (response) {
                //    console.log(JSON.stringify(response.data));
                //    resolve(response.text)
                // })
                // .catch(function (error) {
                //    console.log(error);
                //    resolve("出错了！")
                // });
                const options = {
                    method: 'POST',
                    'method': 'POST',
                    'url': 'http://127.0.0.1:1024/sendMsg',
                    'headers': {
                       'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                       "msg": data.message[1].data.text
                    })
                  };
                  
                  request(options, function (error, response, body) {
                    let res = body
                    if(Auth.isUserVoiceOpen(userId))//if先不看
                    resolve(audio.synthesizeSpeech(res));
                    else{
                        resolve(res)
                    }
                   
                    if(error){
                        console.log(body)
                    }
                  })
            })
        }
    }

]

module.exports = messageGroupConfig

