const nodemailer = require("nodemailer");

const mailer =  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.mail_user,
        pass: process.env.mail_pass,
    }
})

module.exports = mailer;