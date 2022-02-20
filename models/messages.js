const mongoose = require("mongoose");

const message = new mongoose.Schema({
    usr : {
        type: "String"
    },
    passwd : {
        type: "String"
    },
    messages : [{
        to: {
            type: "String"
        },
        text: {
            type: "String"
        }
    }]
});

const messages = mongoose.model("chats", message);

module.exports = messages;