const axios = require("axios");
const request = require("request");
const {segment} = require("oicq")
// 允许的群组(注意自动处理事件白名单群，不要和聊天白名单群混淆)


const autoConfig = {
    data: {
        intervalTime:  60 * 1000, // 轮询间隔时间
    },
    // time目前是取[0, 23]的整数, 表示每天触发的时间
    // 注意让events的时间升序排列
    events: [
        {
            time: 7,
            minutes:30,
            callback: (data, bot) => {
                return new Promise(resolve=>{
                    let timemsg = ['早上好呀！今天也有快乐编程吗？','早上好！制定好今天的计划了吗？',
                    '早上好！今天要是心情不太好的话，去做做自己喜欢的事吧','哦哈哟！今天的运动量也请达标！'].randomOne()
                    const reply = [
                        {
                            type: 'image',
                            
                            data: {
                                file: 'f3e65a7b13e761c3341fbde3a9a75997372405-626-558.png'
                            }
                        },
                        {
                            type: 'text',
                            data: {
                                text: timemsg
                            }
                        }
                    ]
                    // 顺手点10个赞
                    bot.sendLike(3403290479, 10);
                    bot.sendLike(167918513, 10);
                    bot.sendLike(1224999366, 10);
                    bot.sendLike(2220231336, 10);
                    bot.sendLike(1057443973, 10);
                    resolve(reply);
                    
                })
            
            }
        },
        {
            time: 7,
            minutes:59,
            callback: (data, bot) => {
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
                        resolve(msglist)
                    }).catch(e => {
                        console.error(`历史上的今天接口出错了 | ${e.message}`)
                        resolve('休息一下吧')
                    })
                })
            }
        },
         {
            time: 8,
            minutes: 01,
            callback: (data, bot) => {
                 return new Promise(resolve => {
                let img="https://imgapi.xl0408.top/index.php"
                let url=segment.image(img,false);
                let msglist=[url];
                msglist.push("今天份的图片请查收！希望今天能继续开心喔！");
                resolve(msglist);
            })
            }
        },
         {
            time: 23,
            minutes:10,
            callback: (data, bot) => {
                return new Promise(resolve=>{
                    let timemsg = ['呼~太晚了，公主得去睡觉了，大家晚安~','啊！不知不觉已经11点过了！公主得赶快睡觉了，大家晚安~',
                    '不要熬夜喔！公主提醒大家得注意休息了~','睡觉！睡觉！大家晚安！呼呼呼~'].randomOne()
                    const reply = [
                        {
                            type: 'image',
                            
                            data: {
                                file: 'f3e65a7b13e761c3341fbde3a9a75997372405-626-558.png'
                            }
                        },
                        {
                            type: 'text',
                            data: {
                                text: timemsg
                            }
                        }
                    ]
                    // 顺手点10个赞
                    resolve(reply);
                    
                })
            
            }
        },
    ]
}
module.exports = autoConfig

