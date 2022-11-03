const { admins, logChat } = require("./../data/config");
const { sendMessageToChat } = require("./../bot-api/tg-bot");
const isAdmin = (id) => admins.includes(id);
const log = (text) => {
    sendMessageToChat(logChat, text)
}

module.exports = {
    isAdmin,
    log
};
