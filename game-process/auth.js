const { sendMessageToChat } = require("../bot-api/tg-bot");
const { userInfo, usersCount, keyboard } = require("../utils/utils");
const { log } = require("./admin");
const { isStarted } = require("./process");
const { checkPassword } = require("./team");
const { checkUser, addUser } = require("./user");

const handlePassword = async (id, username, name, text) => {
    const team = await checkPassword(id, text);
    if (team) {
        const user = await addUser(id, username, name);
        log(
            `⏺<b>Новый пользователь в команде:\n"${
                team.name
            }"</b>\n(${usersCount(team.chats.length)})\n\n` +
                userInfo(username, name)
        );
        const message = (await isStarted())
            ? "<b>Расследование уже началось!</b>\n\nПри момощи клавиатуры снизу вы можете получить список заданий и посмотреть ещё раз правила\nНайденные коды вводятся в бот латинскими буквами и цифрами\n\nУ вас есть n часа!"
            : "Ожидайте начала расследования";
        sendMessageToChat(
            id,
            `Вы подключились к команде "<b>${team.name}</b>"\n\n` + message
        );
    } else {
    }
};

module.exports = {
    handlePassword,
};
