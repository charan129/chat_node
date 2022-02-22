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

app.get("/register", (req, res) => {
    if (session.charLength == undefined) {
        res.locals.char = false;
    }
    else {
        res.locals.char = true;
    }
    res.render("register.ejs");
})

app.post("/register", async (req, res) => {
    const count = await messages.countDocuments({"usr": req.body["uname"]}, {limit:1});
    if (req.body["uname"].length >= 8 && req.body["pword"].length >= 8 && count != 1) {
        await messages.insertMany({"usr": req.body["uname"], "passwd": req.body["pword"]});
        res.redirect("/login");
    }
    else {
        session.charLength = "no";
        res.redirect("/register");
    }

})

app.get("/login", (req, res) => {
    if (session.pwdMatch == undefined) {
        res.locals.match = false;
    }
    else {
        res.locals.match = true;
    }
    res.render("login.ejs");
})

app.post("/login", async (req, res) => {
    const count = await messages.countDocuments({"usr":req.body["usr"], "passwd":req.body["passwd"]}, {limit: 1});
    
    if (count === 1) {
        session.userId = req.body["usr"];
        res.redirect("/login/contact");
    } 
    else {
        session.pwdMatch = "no";
        res.redirect("/login");
    }

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
    console.log(session.userId, session.senderId)
    const present = await msgs.countDocuments({"from": session.senderId, "to": session.userId}, {limit: 1});
    console.log(present)
    if (present == 1) {
        const tm = await msgs.findOne({"from":session.senderId, "to":session.userId})
        res.locals.textMessages = tm["m"];
        session.conncection = "old";
    }
    else {
        const value = await msgs.countDocuments({"from": session.userId, "to": session.senderId}, {limit: 1});
        console.log(value)
        if (value == 1){}
        else {
            await msgs.insertMany({"from":session.userId, "to":session.senderId});
        }
        const tm = await msgs.findOne({"from":session.userId, "to":session.senderId})
        console.log(tm);
        res.locals.textMessages = tm["m"];
    }
    
    res.render("home.ejs");
} )

app.post("/home", async (req, res, next) => {
    if (session.conncection == undefined) {
        await msgs.updateOne({"from": session.userId, "to": session.senderId}, {$push:{m:req.body["mg"]}});
    }
    else {
        await msgs.updateOne({"from": session.senderId, "to": session.userId}, {$push:{m:req.body["mg"]}});
    }
    next();
})

app.post("/home", (req, res) => {
    res.redirect("/home");
})

app.listen(port, ()=>{
    console.log(`listening on ${port}`);
});