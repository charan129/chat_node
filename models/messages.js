const mongoose = require("mongoose");

const message = new mongoose.Schema({
    usr : {
        type: "String"
    },
    passwd : {
        type: "String"
    },
    email : {
        type: "String"
    }
});

const messages = mongoose.model("chats", message);

module.exports = messages;