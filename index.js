const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 4000;
const messages = require("./models/messages");
const util = require("util");

mongoose.connect("mongodb://localhost:27017/chat");

app.use(express.urlencoded({extended: true}));

app.get("/login", (req, res) => {
    res.sendFile("/home/charan/chat_node/login.html");
})

app.post("/login", (req, res) => {
    
    messages.insertMany(req.body).then(message =>{
        res.send(message);
    });
    
    //res.redirect("/login/contact");
})

app.get("/login/contact", (req, res) => {
    res.sendFile("/home/charan/chat_node/contact.html");
})

app.post("/login/contact", (req, res) => {
    res.send(req.body['contact']);
})

app.listen(port, ()=>{
    console.log(`listening on ${port}`);
});