const messageGroupConfig = require('../service/group')
const messagePrivateConfig = require('../service/user')
const white_list = require('../service/white_list')
const {segment} = require("oicq");


Array.prototype.randomOne = function () {
    let randomIndex = Math.round(Math.random() * 1010) % this.length;
    return this[randomIndex]
}
String.prototype.containAny = function (keywords) {
    if (!keywords.length) {
        return true
    }
    for (let s of keywords) {
        if (this.indexOf(s) !== -1) {
            return true
        }
    }
    return false
}

// 节流处理:一段时间内只受理一定数目的任务,超出的抛弃掉
const MAX_NUM = 10   // 最大任务数目
const REFRESH_TIME = 4000 // 约每4s处理1个任务
let currentNum = 0
setInterval(() => {
    if (currentNum > 0) {
        currentNum--
    }
}, REFRESH_TIME)


// 允许的群组(白名单)
const groups = [
    828192817,  // 2022乐程招新群
    742958634, // master-测试群
    575626767, // dev
    897084848, // 外界公开测试群1
    // '891678779'  // 外界公开测试群2
    640265015,
    875981114,
    700970760,
    633821247,
    557326005,
    755821137,
    950203955,
    765805578
]
// 入群欢迎白名单
const welcomeGroups = [
    828192817,
    575626767,
    633821247,
    755821137
]


// 功能: 处理群发消息
// 参数 data: 收到的消息数据
// 参数 bot: 机器人对象
function messageGroupHandler(data, bot) {
    // console.log(bot)
    if (currentNum > MAX_NUM) {
        return
    }
    currentNum++

    // 先要@自己才能触发
    if (data.atme === true) {
        // 如果不再在白名单群组里面
        if (!groups.includes(data.group_id)) {
            console.log('群id不在白名单之内', data.group_id)
            return
        }

        // 遍历每个配置，观察里面是否有匹配的关键字
        for (let one of messageGroupConfig) {
            let isContain = false
            if (one.handle_type === 'default') {
                isContain = true
            } else {
                for (let msg of data.message) {
                    if (msg.type === 'text') {
                        // console.log(data.message)
                        // handler白名单, 交给default处理
                        isContain = msg.data.text.containAny(one.keywords)
                            && !msg.data.text.containAny(white_list)
                        // console.log(msg.data.text + ' | ' + one.keywords + ' | ' + white_list + ' | ' + isContain)
                        break
                    }
                }
            }

            if (isContain) {
                if (one.callback) {
                    one.callback(data, bot).then((res) => {
                        // bot.send()
                        data.reply(res)
                    }).catch(error => {
                        data.reply("休息一下吧")
                        console.log(error)
                    })
                } else {
                    data.reply(one.reply)
                }

                break
            }
        }
    }
}


// 功能: 处理私发消息, 可以用于更新内容的扩展的测试，和之后计划的公众号、小程序消息的自动化转发等等
// 参数 data: 收到的消息数据
// 参数 boy: 机器人对象
function messagePrivateHandler(data, bot) {
    if (currentNum > MAX_NUM) {
        return
    }
    currentNum++

    for (let one of messagePrivateConfig) {
        let isContain = false
        if (one.handle_type === 'default') {
            isContain = true
        } else {
            for (let msg of data.message) {
                if (msg.type === 'text') {
                    // handler白名单, 交给default处理
                    isContain = msg.data.text.containAny(one.keywords)
                        && !msg.data.text.containAny(white_list)
                    break
                }
            }
        }
        if (isContain) {
            if (one.callback) {
                one.callback(data, bot).then((res) => {
                    data.reply(res)
                }).catch(error => {
                    data.reply("休息一下吧")
                    console.log(error)
                })
            } else {
                data.reply(one.reply)
            }
            break
        }
    }

    // data.sendGroupMsg(742958634, data.message) // 转发到测试群
}

// 功能: 加群欢迎
const demoData = {
    self_id: 1770874035,
    time: 1658582424,
    post_type: 'notice',
    notice_type: 'group',
    sub_type: 'increase',
    group_id: 828192817,
    user_id: 2083892646,
    nickname: 'Gin.'
}

function groupMemberIncrease(data, bot) {
    // todo add more
    const welcomes = [
        '新人，快到碗里来。',
        '欢迎欢迎, 热烈欢迎~!',
        '欢迎！请多多了解ITA协会！'
    ]

    if (!welcomeGroups.includes(data.group_id)) {
        console.log(`该群人数增加事件不在白名单中 | group: ${data.group_id}`)
        return
    }

    if (data.sub_type === 'increase') {
        let reply = [
            segment.at(data.user_id),
            ' ,' + welcomes.randomOne(),
            '\n\n我是协会的机器人,名字叫公主， @我体验更多功能吧'
        ]
        bot.sendGroupMsg(data.group_id, reply).then().catch(e => {
            console.error(e)
        })
    }
}

module.exports = {
    messageGroupHandler,
    messagePrivateHandler,
    groupMemberIncrease
}

