const express = require("express");
const app = express();
const port = 4000;

app.use(express.urlencoded({extended: true}));

app.get("/login", (req, res) => {
    res.sendFile("/home/charan/chat_node/login.html");
})

app.post("/login", (req, res) => {
    res.redirect("/login/contact");
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