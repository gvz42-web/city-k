const { connect } = require("mongoose");

const connectDB = async () => {
    try {
        await connect(process.env.DB_URI, {
            useNewUrlParser: true,
        });
        console.log("Database has connected");
    } catch (e) {
        console.log(e);
    }
};

const find = async (Model, query) => {
    return await Model.find(query, async (err, result) => {
        if (err) console.log(err);
    })
        .clone()
        .catch(function (err) {
            console.log(err);
        });
};

const findOne = async (Model, query) => {
    return await Model.findOne(query, async (err, result) => {
        if (err) console.log(err);
    })
        .clone()
        .catch(function (err) {
            console.log(err);
        });
};

const createNew = async (Model, obj) => {
    return Model.create(obj);
};

const clear = async (Model, query) => {
    return await Model.deleteMany(query, async (err, result) => {
        if (err) console.log(err);
    })
        .clone()
        .catch(function (err) {
            console.log(err);
        });
};

module.exports = {
    find,
    findOne,
    connectDB,
    createNew,
    clear,
};
