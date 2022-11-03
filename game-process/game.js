const { sendMessageToChat, sendMessageToList } = require("../bot-api/tg-bot");
const tasks = require("../data/tasks");
const { listTasks } = require("../utils/utils");
const { log } = require("./admin");
const { completeTask, getTeamByUserId } = require("./team");

const sendResult = (id, n) => {
    const task = tasks[n].task.result;
    sendMessageToChat(
        id,
        `<b>Зацепка №${n + 1}:</b>\n\n` + task.text,
        {},
        { images: task.images }
    );
    if (task.after) {
        setTimeout(() => sendMessageToChat(id, task.after), 2000);
    }
};

const sendTasks = (id) => {
    const images = tasks.map((t) => t.task.image);
    sendMessageToChat(
        id,
        undefined,
        {},
        {
            images,
        }
    );
};

const checkAnswer = async (id, text) => {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].task.ans == text) {
            const team = await completeTask(id, i + 1);
            if (team) {
                sendMessageToList(
                    team.chats,
                    `<b>${i + 1} зацепка разгадана!</b>\n\n${listTasks(
                        team.completed
                    )}`
                );
                sendResult(id, i);
                log(
                    `❇️<b>Команда "${team.name}" решила задание ${
                        i + 1
                    }</b>\n\n${listTasks(team.completed)}`
                );

                if (team.completed.length == tasks.length) {
                    log(
                        `🔥<b>Команда "${team.name}" завершила все задания и получила последнее!</b>`
                    );
                    setTimeout(() => {
                        sendMessageToList(
                            team.chats,
                            "Думаю, я должен показать кое-что интересное. Сейчас пришлю."
                        );
                    }, 20000);
                    setTimeout(() => {
                        sendMessageToList(
                            team.chats,
                            undefined,
                            {},
                            {
                                audio: "CQACAgIAAxkBAAIFkmNkN5fRkBJqAUxMWCydYplbBlO-AAJoJgACo84hS0XfuJbEmu0WKgQ",
                            }
                        );
                    }, 21000);
                    setTimeout(() => {
                        sendMessageToList(
                            team.chats,
                            "Чёрт, я отправил не тот файл"
                        );
                    }, 46000);
                    setTimeout(() => {
                        sendMessageToList(
                            team.chats,
                            "Теперь все узнают правду... Я должен успеть на встречу с Доном до того момента, пока он всё не узнает"
                        );
                    }, 47000);
                }
                return true;
            } else {
                sendMessageToChat(id, "<b>Этот код уже засчитан</b>");
                return false;
            }
        }
    }
    const team = await getTeamByUserId(id);
    sendMessageToChat(id, "<b>Такого кода нет</b>");
    log(`<b>Команда "${team.name}"</b>\nПопытка ввода:<pre>${text}</pre>`);
};

module.exports = {
    sendTasks,
    checkAnswer,
};
