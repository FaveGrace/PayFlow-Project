const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
    try{
        let mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL}`,//Put the email address you want to send from
                pass: `${process.env.EMAIL_PASSWORD}`//if you use gmail, you would need to provide a generated password, however,
             //if you have another account that is not gmail, then you can provide the password
            }
        });

        const mailDetails = {
            from: `${process.env.EMAIL}`,
            to: `${email}`,
            subject: 'Verify your email',
            html: `<h1>Here is the token to verify your email. Please click the button.
            
            <a class"" href='https://www.payflow.com/verify-email/${token}'>Click here to verify your email.</a>
            
            If the button does not work, please copy and paste the link below into your browser:
            https://www.payflow.com/verify-email/${token}

            ${token}
            
            </h1>`
        };

        await mailTransport.sendMail(mailDetails)
    }catch(error){
        console.log(error);
    }
}

const sendForgotPasswordEmail = async (email, token) => {
    try{
        let mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL}`,//Put the email address you want to send from
                pass: `${process.env.EMAIL_PASSWORD}`//if you use gmail, you would need to provide a generated password, however,
             //if you have another account that is not gmail, then you can provide the password
            }
        });

        const mailDetails = {
            from: `${process.env.EMAIL}`,
            to: `${email}`,
            subject: 'Reset your password',
            html: `<h1>Here is the token to reset your password. Please click the button.
            
            <a class"" href='https://www.payflow.com/reset-password/${token}'>Click here to reset your password.</a>
            
            If the button does not work, please copy and paste the link below into your browser:
            https://www.payflow.com/reset-password/${token}

            ${token}
            
            </h1>`
        };

        await mailTransport.sendMail(mailDetails)
    }catch(error){
        console.log(error);
    }
}

const validEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()\[\]\\.,;:\s@"]+\.)+[^<>()\[\]\\.,;:\s@"]{2,})$/;
    return re.test(String(email).toLowerCase());
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.EMAIL}`,//Put the email address you want to send from
        pass: `${process.env.EMAIL_PASSWORD}`//if you use gmail, you would need to provide a generated password, however,
     //if you have another account that is not gmail, then you can provide the password 
    }
});
const sendEmail = async (email, subject, text) => {
    const mailOptions = {
        from: `${process.env.EMAIL}`,
        to: email,
        subject: subject,
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error(error);
    }
}

module.exports = { 
    sendVerificationEmail, 
    sendForgotPasswordEmail, 
    validEmail,
    sendEmail};