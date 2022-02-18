const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 4000;
const messages = require("./models/messages");

mongoose.connect("mongodb://localhost:27017/chat");

app.use(express.urlencoded({extended: true}));

app.get("/login", (req, res) => {
    res.sendFile("/home/charan/chat_node/login.html");
})

app.post("/login", async (req, res) => {
    const count = await messages.countDocuments({"usr":req.body["usr"]}, {limit: 1});
    
    if (count === 1) {
        res.send("Already exists!");
    } 
    else {
        messages.insertMany(req.body).then(message =>{
        res.send(message);
        })
    }  
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