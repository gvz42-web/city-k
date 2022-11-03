const { findOne, clear, find, createNew } = require("./../services/db");
const { Schema, model } = require("mongoose");

const schemaChats = new Schema({
    chatId: { type: Number, required: true },
    username: { type: String, required: true },
    name: { type: String, required: true },
});

const Chats = model("Chat", schemaChats);

const checkUser = async (id) => {
    let user = await findOne(Chats, { chatId: id });
    return user;
};

const clearUsers = async () => {
    return await clear(Chats, {});
};

const addUser = async (id, username, name) => {
    const user = {
        chatId: id,
        username,
        name,
    };
    return await createNew(Chats, user);
};

const getAllUsers = async () => {
    const chats = await find(Chats, {});
    return chats.map((c) => c.chatId);
};

module.exports = {
    clearUsers,
    checkUser,
    addUser,
    getAllUsers,
};
