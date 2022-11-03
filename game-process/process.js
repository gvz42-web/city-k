const { Schema, model } = require("mongoose");
const { sendMessageToList } = require("../bot-api/tg-bot");
const { findOne, createNew } = require("../services/db");

const schemaGame = new Schema({
    isStarted: { type: Boolean, required: true },
    startTime: { type: Date },
});

const Process = model("Process", schemaGame);

const startGame = async () => {
    const process = await findOne(Process, {});
    if (process.isStarted) {
        return false;
    }
    process.isStarted = true;
    process.startTime = Date.now();
    process.save();
    return process;
};

const endGame = async () => {
    const process = await findOne(Process, {});
    if (!process) {
        createNew(Process, {
            isStarted: false,
            startTime: undefined,
        });
    }
    process.isStarted = false;
    process.startTime = undefined;
    process.save();
    if (alert) {
        alert.gracefulShutdown();
    }
};

const isStarted = async () => {
    const process = await findOne(Process, {});
    return process.isStarted;
};

module.exports = {
    startGame,
    endGame,
    isStarted,
};
