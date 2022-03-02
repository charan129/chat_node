const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const port = process.env.PORT;
const messages = require("./models/messages");
const msgs = require("./models/sending");
const mailer = require("./utilities/email");
const crypto = require("crypto");


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

app.get('/', (req, res) => {
    res.redirect("/home");
})

app.get("/register", (req, res, next) => {
    if (session.reg == undefined) {
        res.locals.registered = session.reg;
        next();
    }
    else {
        res.locals.registered = session.reg;
        delete session.reg;
        next();
    }
})

app.get("/register", (req, res) => {
    res.render("register.ejs");
})

app.post("/register", async (req, res) => {
    const count = await messages.countDocuments({"usr": req.body["uname"]}, {limit:1});
    const countMail = await messages.countDocuments({"email": req.body["email"]}, {limit: 1});
    if (req.body["uname"].length >= 8 && req.body["pword"].length >= 8 && count != 1 && countMail != 1) {
        session.u = req.body["uname"];
        session.p = req.body["pword"];
        session.e = req.body["email"];
        
        const verifyCode = crypto.randomUUID();

        session.vcode = verifyCode;

        mailer.sendMail({
         from: process.env.mail_user,
         to: req.body["email"],
         subject: "Subject",
         text: `${verifyCode}`
         }, (err, info) => {
         if (err) {console.log(err);}
         else {console.log("Email Successfully sent!", info);}
         })
        res.redirect("/register/email-verify");
    }
    else if (req.body["uname"].length >= 8 && req.body["pword"].length >= 8 && count != 1 && countMail == 1) {
        session.reg = "Email already exists!";
        res.redirect("/register");
    }
    else if (req.body["uname"].length >= 8 && req.body["pword"].length >= 8 && count == 1 && countMail != 1) {
        session.reg = "Username already exists!";
        res.redirect("/register");
    }
    else if (req.body["uname"].length >= 8 && req.body["pword"].length >= 8 && count == 1 && countMail == 1) {
        session.reg = "Both Username and Email already exists!";
        res.redirect("/register");
    }
    else {
        session.reg = "Both the username and password should be 8 or above characters";
        res.redirect("/register");
    }

})

app.get("/register/email-verify", (req, res, next) => {
    if (session.verify == undefined) {
        res.locals.verification = session.verify;
        next();
    }
    else {
        res.locals.verification = session.verify;
        delete session.verify;
        next();
    }
})

app.get("/register/email-verify", (req, res)=>{
    res.render("email-verify.ejs");
});

app.post("/register/email-verify", async (req, res)=>{
    if (req.body["verifyemail"] == session.vcode && session.vcode != undefined) {
        await messages.insertMany({"usr": session.u, "passwd": session.p, "email": session.e});
        delete session.u;
        delete session.p;
        delete session.e;
        delete session.vcode;
        res.redirect("/login");
    }
    else {
        session.verify = "The Verification code does not match!"
        res.redirect("/register/email-verify");
    }
});

app.get("/login", (req, res, next) => {
    if (session.pwdMatch == undefined) {
        res.locals.match = session.pwdMatch;
        next();
    }
    else {
        res.locals.match = session.pwdMatch;
        delete session.pwdMatch;
        next();
    }
})

app.get("/login", (req, res) => {
    res.render("login.ejs");
})

app.post("/login", async (req, res) => {
    const count = await messages.countDocuments({"usr":req.body["usr"], "passwd":req.body["passwd"]}, {limit: 1});
    
    if (count === 1) {
        session.userId = req.body["usr"];
        res.redirect("/login/contact");
    } 
    else {
        session.pwdMatch = "The username and the password does not match!";
        res.redirect("/login");
    }

})

app.get("/login/contact", (req, res, next) => {
    if (session.noUser == undefined) {
        res.locals.noUsr = session.noUser;
        next();
    }
    else {
        res.locals.noUsr = session.noUser;
        delete session.noUser;
        next();
    }
})

app.get("/login/contact", (req, res) => {
    res.render("contact.ejs");
})

app.post("/login/contact", async (req, res) => {
    const count = await messages.countDocuments({"usr":req.body["contact"]}, {limit: 1});
    
    if (count === 1) {
        session.senderId = req.body["contact"];
        res.redirect("/home");
    }
    else {
        session.noUser = "The username does not exist";
        res.redirect("/login/contact");
    }
})

app.use("/home", (req, res, next) => {
    if (session.userId == undefined) {
        console.log("No login");
        res.redirect("/login");
    }
    else if (session.senderId == undefined) {
        console.log("No Contact");
        res.redirect("/login/contact");
    }
    else {next()}
}) 

app.get("/home", async (req, res) => {
    console.log(session.userId, session.senderId)
    const present = await msgs.countDocuments({"from": session.senderId, "to": session.userId}, {limit: 1});
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