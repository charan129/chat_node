const express = require("express");
const app = express();
const sessions = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const port = 4000;
const messages = require("./models/messages");
const msgs = require("./models/sending");

mongoose.connect("mongodb://localhost:27017/chat");

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
let session = app.use(sessions({
            secret: "mysecretkey",
            saveUninitialized: true,
            resave: false,
            cookie: {maxAge: 1000*60*60}
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
        await messages.insertMany(req.body);
    }
    session.userId = req.body["usr"];
    res.redirect("/login/contact");
})

app.use("/login/contact", (req, res, next) => {
    if (session.userId == undefined) {
        console.log("No login");
        res.redirect("/login");
    }
    else {next();}
}) 

app.get("/login/contact", (req, res) => {
    res.render("contact.ejs");
})

app.post("/login/contact", (req, res, next)=> {
    req.flash("txt","Does not exist")
    res.locals.exist = req.flash();
    next();  
})

app.post("/login/contact", async (req, res) => {
    const count = await messages.countDocuments({"usr":req.body["contact"]}, {limit: 1});
    
    if (count === 1) {
        session.senderId = req.body["contact"];
        res.redirect("/home");
    }
    else {
        res.render("flash.ejs");
    }
})

app.use("/home", (req, res, next) => {
    if (session.userId == undefined || session.senderId == undefined) {
        console.log("No login");
        res.redirect("/login");
    }
    else {next()}
}) 

app.get("/home", async (req, res) => {

    const present = await msgs.countDocuments({"from": session.userId, "to": session.senderId}, {limit: 1});
    if (present == 1) {}
    else {
        await msgs.insertMany({"from":session.userId, "to":session.senderId});
    }
    const tm = await msgs.findOne({"from":session.userId, "to":session.senderId})
    res.locals.textMessages = tm["m"];
    res.render("home.ejs");
} )

app.post("/home", async (req, res, next) => {
    await msgs.updateOne({"from": session.userId, "to": session.senderId}, {$push:{m:req.body["mg"]}});
    next();
})

app.post("/home", (req, res) => {
    res.redirect("/home");
})

app.listen(port, ()=>{
    console.log(`listening on ${port}`);
});