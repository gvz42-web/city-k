const { listTasks, keyboard } = require("../utils/utils");
const { createTeam, getStat, clearTeams } = require("./team");
const { isAdmin, log } = require("./admin");
const { gameDes } = require("./../data/config");
const { sendMessageToChat, sendMessageToList } = require("../bot-api/tg-bot");
const { checkUser, clearUsers, getAllUsers } = require("./user");
const { handlePassword } = require("./auth");
const { sendTasks, checkAnswer } = require("./game");
const { startGame, endGame, isStarted } = require("./process");

const COMMANDS = {
    ADMIN: {
        CREATE_TEAM: "/createteam",
        GET_STAT: "/getstat",
        CLEAR_DB: "/cleardb",
        GET_USERS: "/getusers", // no functional yet
        START_GAME: "/startgame",
    },
    USER: {
        START: "/start",
        INFO: "Правила квеста",
        TASKS: "Задания",
    },
    UNAUTHORIZED: {
        START: "/start",
    },
};

const HANDLERS = {
    ADMIN: [
        {
            command: COMMANDS.ADMIN.GET_STAT,
            handler: async (param, id) => {
                let list = "";
                const teams = await getStat();
                if (teams.length) {
                    for (let i = 0; i < teams.length; i++) {
                        let team = teams[i];
                        list += `<b>${team.name}</b>\n${listTasks(
                            team.completed
                        )}\n\n`;
                    }
                    log(list);
                } else {
                    log("❌Команд в базе нет");
                }
            },
        },
        {
            command: COMMANDS.ADMIN.CREATE_TEAM,
            handler: async (param, id) => {
                const t = await createTeam(param);
                log(
                    `✅<b>Создана новая команда</b>\n\nНазвание: <b>${t.name}</b>\nПароль: <b>${t.password}</b>`
                );
            },
        },
        {
            command: COMMANDS.ADMIN.CLEAR_DB,
            handler: async (param, id) => {
                const t = await clearTeams();
                const u = await clearUsers();
                const p = await endGame();
                log(`⭕️<b>База полностью очищена, квест остановлен</b>`);
            },
        },
        {
            command: COMMANDS.ADMIN.START_GAME,
            handler: async () => {
                const process = await startGame();
                if (process) {
                    log(
                        `🔥🔥🔥<b>Квест начался</b>🔥🔥🔥\n\n${process.startTime}`
                    );
                    const all = await getAllUsers();
                    sendMessageToList(
                        all,
                        "🔥<b>Расследование началось!</b>\n\nПри момощи клавиатуры снизу вы можете получить список заданий и посмотреть ещё раз правила\nНайденные коды вводятся в бот латинскими заглавными буквами и цифрами\n\nУ вас есть 3 часа!",
                        {
                            reply_markup: keyboard(),
                        }
                    );
                }
            },
        },
    ],
    USER: [
        {
            command: COMMANDS.USER.INFO,
            handler: async (param, id) => {
                sendMessageToChat(id, gameDes.info);
            },
        },
        {
            command: COMMANDS.USER.TASKS,
            handler: async (param, id) => {
                sendTasks(id);
            },
        },
        {
            command: "✅",
            handler: async (param, id) => {
                sendMessageToChat(id, "Эту зацепку вы уже нашли");
            },
        },
    ],
    UNAUTHORIZED: [
        {
            command: COMMANDS.UNAUTHORIZED.START,
            handler: async (param, id) => {
                sendMessageToChat(id, gameDes.start);
            },
        },
    ],
};

const handleCommand = (id, text, type) => {
    for (let i = 0; i < HANDLERS[type].length; i++) {
        let { command, handler } = HANDLERS[type][i];
        if (text.includes(command)) {
            handler(text.substr(command.length + 1), id);
            return true;
        }
    }
};

const handleMessage = async (msg) => {
    if (isAdmin(msg.id)) {
        if (!(await handleCommand(msg.id, msg.text, "ADMIN"))) {
            sendMessageToChat(
                msg.id,
                "<b>Ошибка!</b>\n<pre>Незнакомая команда</pre>"
            );
        }
    } else if (await checkUser(msg.id)) {
        if (await isStarted()) {
            if (!(await handleCommand(msg.id, msg.text, "USER"))) {
                checkAnswer(msg.id, msg.text);
            }
        } else {
            sendMessageToChat(msg.id, "<b>Ожидайте начала расследования</b>");
        }
    } else {
        if (!(await handleCommand(msg.id, msg.text, "UNAUTHORIZED"))) {
            sendMessageToChat(
                msg.id,
                "Для доступа к квесту нужно ввести пароль"
            );
        }
        await handlePassword(msg.id, msg.username, msg.name, msg.text);
    }
};

module.exports = {
    handleMessage,
};
