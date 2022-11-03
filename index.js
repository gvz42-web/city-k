const { onMessage } = require("./bot-api/tg-bot");
const config = require("./data/config");
const { handleMessage } = require("./game-process/handler");
const { checkUser } = require("./game-process/user");
const { isAdmin } = require("./game-process/admin");
const { connectDB } = require("./services/db");
connectDB();

onMessage(handleMessage);
