const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const port = 4000;
const messages = require("./models/messages");

mongoose.connect("mongodb://localhost:27017/chat");

app.use(express.urlencoded({extended: true}));
app.use(cookieParser("secret"));
app.use(session({
            secret: "secretsession",
            saveUninitialized: true,
            resave: true
        }
    )
);
app.use(flash());

app.get("/login", (req, res) => {
    res.sendFile("/home/charan/chat_node/login.html");
})

app.post("/login", async (req, res) => {
    const count = await messages.countDocuments({"usr":req.body["usr"]}, {limit: 1});
    
    if (count === 1) {
        console.log("Already Exists!");
        
    } 
    else {
        messages.insertMany(req.body).then(message =>{
        console.log(message);
        })
    }  
    res.redirect("/login/contact");
})

app.get("/login/contact", (req, res) => {
    res.render("contact.ejs");
})

app.post("/login/contact", (req, res, next)=> {
    req.flash("msg","Does not exist")
    res.locals.exist = req.flash();
    next();  
})

app.post("/login/contact", async (req, res) => {
    const count = await messages.countDocuments({"usr":req.body["contact"]}, {limit: 1});
    
    if (count === 1) {
        res.redirect("/home");
    }
    else {
        res.render("flash.ejs");
    }
})

app.get("/home", (req, res) => {
    res.send("Here");
} )

app.listen(port, ()=>{
    console.log(`listening on ${port}`);
});