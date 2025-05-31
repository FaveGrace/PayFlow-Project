const nodemailer = require('nodemailer');

const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.EMAIL}`, // Put the email address you want to send from
        pass: `${process.env.EMAIL_PASSWORD}` // If you use gmail, you would need to provide a generated password, however,
        // if you have another account that is not gmail, then you can provide the password
    }
});

const sendEmail = async (email, subject, text) => {
   try{
     await mailTransport.sendMail({
        from: `${process.env.EMAIL}`,
        to: `${email}`,
        subject,
        text
    })
   }catch(error){
       console.log({message: "Email sending failed", error});
   }
}


module.exports = {
    sendEmail
};

// This module handles sending emails for various notifications in the PayFlow digital wallet system.
// It uses nodemailer to send emails and provides templates for different types of notifications.