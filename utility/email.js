const nodemailer = require('nodemailer');
const { logTrace } = require('./logs');

const sendEmail = async (to, subject, text) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'bmsbossreporting@gmail.com', // generated ethereal user
            pass: 'yxuyhkscsntwkokr', // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'bmsbossreporting@gmail.com', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        // html: '<b>Hello world?</b>', // html body
    });

   logTrace('Message sent: %s', info.messageId);
}

module.exports = {
    sendEmail
}