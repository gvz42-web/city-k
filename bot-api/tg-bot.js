const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

let bot;
bot = new TelegramBot(process.env.T_TOKEN, { polling: true });
console.log("Bot has started");

const sendMessageToChat = (id, text, options = {}, media = {}) => {
    if (media.images) {
        if (media.images.length > 1) {
            let array = [];
            for (let i = 0; i < media.images.length; i++) {
                array.push({
                    type: "photo",
                    media: media.images[i],
                    caption: i == 1 ? text : undefined,
                    parse_mode: i == 1 ? "HTML" : undefined,
                });
            }
            return bot.sendMediaGroup(id, array);
        }
        return bot.sendPhoto(id, media.images[0], {
            caption: text,
            parse_mode: "html",
        });
    }
    if (media.audio) {
        return bot.sendAudio(id, media.audio, {
            caption: text,
            parse_mode: "html",
        });
    }
    return bot.sendMessage(id, text, { parse_mode: "HTML", ...options });
};

const sendMessageToList = (list, text, options = {}, media = {}) => {
    for (let i = 0; i < list.length; i++) {
        sendMessageToChat(list[i], text, options, media);
    }
};

const onMessage = (handler) => {
    bot.on("message", (message) => {
        console.log(message);
        const msg = {
            id: message.chat.id,
            name: message.chat.first_name,
            username: message.chat.username,
            text: message.text,
        };
        if (msg.text) {
            handler(msg);
        }
    });
};

module.exports = {
    sendMessageToChat,
    sendMessageToList,
    onMessage,
};
