const mongoose = require("mongoose");

const msg = new mongoose.Schema({
    from: {type: "String"},
    to:{type: "String"},
    m:["String"]
})

const msgs = mongoose.model("msgs",msg);
module.exports = msgs;