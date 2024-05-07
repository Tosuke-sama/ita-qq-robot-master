// 主动进行的一些操作
// 比如定时推个加群信息啥的
// 目前先用一个计时器实现
const autoConfig = require('../service/time')
const autoGroups = [
    // '828192817', // 2022乐程招新群
    // '640265015', // 计科院新生群
    // '742958634', // master测试群
    // 875981114,
    // '700970760',
    633821247,
    557326005,
    950203955,
    // "755821137"
]
function autoHandler (data,bot) {
    console.log(`开启定时任务,当前小时:${new Date().getHours()},当前分钟：${new Date().getMinutes()} 轮询时间:${autoConfig.data.intervalTime / 60000} 分钟`)
    setInterval(() => {
        // if (!autoGroups.includes(data.group_id)) {
        //     console.log(autoGroups.includes(data.group_id))
        //     console.log('群id不在白名单之内', data.group_id)
        //     return
        // }
        console.log("执行")
        let currentTimeHour = new Date().getHours()
        let currentTimeminutes = new Date().getMinutes()
        for (let index = 0; index < autoConfig.events.length; index++) {
            if (autoConfig.events[index].time == currentTimeHour&&autoConfig.events[index].minutes==currentTimeminutes) {
                autoConfig.events[index].callback(data,bot).then((res) => {
                    for(let oneGroup of autoGroups) {
                        bot.sendGroupMsg(oneGroup, res)
                    }
                    // data.reply(res)
                }).catch(error => {
                    data.reply("休息一下吧")
                    console.log(error)
                });
            }
        }
    }, autoConfig.data.intervalTime)
}

module.exports = autoHandler
