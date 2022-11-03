const express = require("express");
const mongoose = require("mongoose");
const utils = require("./utils");
const answers = require("./tasks");
const app = express();
const port = 3000;
const orgs = -669661788;
const number = 6;
const me = 765357310;
//const me = 649794908
const tasks = [];

for (let i = 1; i <= number; i++) {
    tasks.push({
        type: "photo",
        media: `${i}.jpg`,
    });
}

app.get("/", (req, res) => res.send("Hello World!"));
const TelegramBot = require("node-telegram-bot-api");
const bodyParser = require("body-parser");
const { Schema, model } = require("mongoose");

const log = (message) => {
    bot.sendMessage(orgs, message);
};

const admin = async (text) => {
    const reg = /(\/[a-z]*)\s(.*)/;
    const match = text.match(reg);

    if (match) {
        const command = match[1];
        const query = match[2];

        if (command === "/createteam") {
            const pass = Math.random().toString(36).slice(-8);
            const t = new Team({ name: query, password: pass });
            await t.save();
            log(`Команда ${query} создана! Пароль: ${pass}`);
            bot.sendMessage(me, `Команда ${query} создана! Пароль: ${pass}`);
            return true;
        }

        return false;
    }

    if (text === "/getstat") {
        const pas = await Team.find({}, async (err, result) => {
            if (err) console.log(err);
            let ans = "";
            if (result) {
                for (let team of result) {
                    ans += `${team.name}:\n${utils
                        .stat(team.completed, number)
                        .join(" ")}\n\n`;
                }
            }
            bot.sendMessage(me, ans ? ans : "В моей базе сейчас нет команд :(");
            log(ans ? ans : "В моей базе сейчас нет команд :(");
        })
            .clone()
            .catch(function (err) {
                console.log(err);
            });
        return true;
    }

    if (text === "/clearallteams") {
        await Team.deleteMany({});
        await Chats.deleteMany({});
        console.log("cleaning teams");
        bot.sendMessage(me, "Все команды удалены из базы");
        return true;
    }

    return false;
};

const toTeam = (chats, message) => {
    for (let c of chats) {
        bot.sendMessage(c, message);
    }
};

const answer = (id, text, arr, name, chats) => {
    const found = answers.find((el) => {
        if (
            el.ans.includes(text) ||
            (el.extra ? el.extra.ans.includes(text) : 0)
        ) {
            return true;
        }
        return false;
    });
    let a = found ? (found.extra ? found.extra.n : found.n) : 0;
    if (!arr.includes(a) && a !== 0) {
        if (found.extra ? !found.extra.ans.includes(text) : false) {
            // bot.sendMessage(id, `Вы ввели правильный ответ на задание ${a}, но ${found.extra.q}`)
            log(`${name} выполнили ${a} задание, и получили дополнительное`);
            toTeam(
                chats,
                `Первая часть задания номер ${a} принята! \n\n${found.extra.q}`
            );
            if (found.extra.audio) {
                for (let i of chats) {
                    bot.sendAudio(i, found.extra.audio);
                }
            }

            if (found.extra.photo) {
                for (let i of chats) {
                    bot.sendPhoto(i, found.extra.photo);
                }
            }
        } else {
            arr.push(a);
            bot.sendMessage(id, `Принято!`);
            toTeam(chats, `Разгадано заметок: ${arr.length}/${number}`);
            log(`${name} выполнили задание ${a}`);
        }
    } else {
        bot.sendMessage(
            id,
            `Хм, не похоже на правильный ответ, возможно вы где-то ошиблись`
        );
        log(`${name}, попытка ввода: ${text}`);
    }

    if (a && arr.length === number) {
        toTeam(
            chats,
            `Поздравляю! Все заметки разгаданы! Мы уже ждем вас в гостинице :)`
        );
        for (let i of chats) {
            bot.sendPhoto(i, "7.jpg");
        }
        log(`${name} завершили все задания!`);
    }

    return arr;
};

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.T_TOKEN;
let bot;
// Create a bot that uses 'polling' to fetch new updates

bot = new TelegramBot(token, { polling: true });

async function start() {
    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
        });
        app.listen(port, () => {
            console.log("Server has been started");
        });
    } catch (e) {
        console.log(e);
    }
}

start();

console.log("Bot server started ");

const schema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    chats: { type: [Number] },
    completed: { type: [Number] },
});

const schemaChats = new Schema({
    chatId: { type: Number, required: true },
});

const Chats = model("Chat", schemaChats);

const Team = model("Team", schema);

bot.setMyCommands([
    { command: "/start", description: "Начать" },
    { command: "/info", description: "Правила квеста" },
    { command: "/list", description: "Список заданий" },
]);

bot.on("message", async (msg) => {
    console.log(msg);
    const text = msg.text;
    const id = msg.chat.id;

    if (id === me) {
        if (await admin(text)) {
            return 0;
        }
    }

    if (id === orgs) {
        return 0;
    }

    if (text === "/start")
        return bot.sendMessage(
            msg.chat.id,
            "Приветствуем вас на нашем квесте!\nЧтобы получить доступ отправьте мне пароль своей команды. Присоединиться к вашей команде и получать уведомления могут сразу несколько человек."
        );

    let users = [];

    const chats = await Chats.find({}, async (err, result) => {
        if (err) console.log(err);
        if (result) {
            await result.forEach((user) => {
                users.push(user.chatId);
            });

            if (users.includes(id)) {
                const t = await Team.findOne(
                    { chats: id },
                    async (err, res) => {
                        if (err) console.log(err);

                        bot.setMyCommands([
                            { command: "/info", description: "Правила квеста" },
                            { command: "/list", description: "Список заданий" },
                        ]);

                        if (text === "/info") {
                            return bot.sendMessage(
                                msg.chat.id,
                                `Правила квеста:
1. Не нарушать правила дорожного движения
2. Не пользоваться личным и общественным транспортом
3. Строго запрещается отрывать или стирать коды
4. В случае возникновения проблем сообщать о них сопровождающему
5. Не мешать другим людям, не участвующим в квесте
6. Не мусорить, не портить окружающую среду
7. Получать максимальное удовольствие от нашего мероприятия

Про коды:
- Код - состоит из 6 символов (цифр и строчных латинских букв)
- Код написан на небольшой белой бумажке (3-5 см) приклеенной скотчем
- Мы не хотим портить памятники, поэтому все коды оставляем на безобидных объектах (на столбах, заборах, скамейках) в близи от объекта/главного входа
- Код вводится в бота как есть (без лишних пробелов, символов и без номера задания)`
                            );
                        }

                        if (text === "/list") {
                            return bot.sendMediaGroup(msg.chat.id, tasks);
                        }

                        res.completed = await answer(
                            id,
                            text,
                            res.completed,
                            res.name,
                            res.chats
                        );
                        await res.save();
                    }
                )
                    .clone()
                    .catch(function (err) {
                        console.log(err);
                    });
            } else {
                const pas = await Team.findOne(
                    { password: text },
                    async (err, result) => {
                        if (err) console.log(err);
                        if (result) {
                            let chat = await new Chats({ chatId: id });
                            await chat.save();
                            await result.chats.push(id);
                            await result.save();
                            bot.sendMessage(
                                orgs,
                                `К игре присоеденился ${msg.chat.first_name} (@${msg.chat.username}) из команды ${result.name}`
                            );
                            return bot.sendMessage(
                                msg.chat.id,
                                `<b>Добро пожаловать, команда ${result.name}!</b>\n\n-Команда /info напомнит вам правила квеста\n-С помощью команды /list вы можете посмотреть все задания\n\nВ каждом задании загадано определенное место, где спрятан код (см правила квеста, чтобы узнать больше о том, как его найти)\n\nКвест будет считаться завершенным тогда, когда вы соберете все коды\n\nЖелаем удачи!`,
                                { parse_mode: "HTML" }
                            );
                        } else {
                            return bot.sendMessage(
                                msg.chat.id,
                                "Похоже, что я вас не знаю... Без пароля вашей команды доступ к системе не возможен \n:("
                            );
                        }
                    }
                )
                    .clone()
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        }
    })
        .clone()
        .catch(function (err) {
            console.log(err);
        });
});

//bot.sendMessage(me, '<b>Поздравляю! Теперь ты мой админ!</b>\n\nКоманды админа:\n\n-<b>Создать команду:\n</b>/createteam [название команды]\n(Создаёт новую команду в базе, присылает пароль тебе и в чат Логи бота. P.S: Скобки квадратные писать не нужно, просто /createteam и название через пробел)\n\n-<b>Получить статистику:\n</b>/getstat\n(Присылает статистику игры тебе и в чат Логи бота. Можно использовать для того, чтобы посмотреть какие команды есть в базе)\n\n-<b>Удалить все команды из базы:\n</b>/clearallteams\n(Полностью чистит базу)\n\nУдачного проведения игр! По всем изменениям касающимся содержания заданий, правил квеста и приветствия писать Максиму', {parse_mode: 'html'})
