const { find, findOne, createNew, clear } = require("./../services/db");
const { Schema, model } = require("mongoose");
const { makePassword } = require("./../utils/utils");

const schemaTeams = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    chats: { type: [Number] },
    completed: { type: [Number] },
});

const Teams = model("Team", schemaTeams);

const checkPassword = async (id, pass) => {
    const team = await findOne(Teams, { password: pass });
    if (team) {
        team.chats.push(id);
        await team.save();
        return team;
    } else {
        return false;
    }
};

const createTeam = (name) => {
    let team = {
        name: name,
        password: makePassword(6),
        chats: [],
        completed: [],
    };
    createNew(Teams, team);
    return team;
};

const getStat = async () => {
    return await find(Teams, {});
};

const clearTeams = async () => {
    return await clear(Teams, {});
};

const getTeamByUserId = async (id) => {
    return await findOne(Teams, { chats: id });
};

const completeTask = async (id, n) => {
    const team = await getTeamByUserId(id);
    if (team.completed.includes(n)) {
        return false;
    }
    team.completed.push(n);
    team.save();
    return team;
};

module.exports = {
    getStat,
    checkPassword,
    createTeam,
    clearTeams,
    getTeamByUserId,
    completeTask,
};
