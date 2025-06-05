const nodemailer = require('nodemailer');

const verificationMail = async (email, verificationToken) => {
    try{
        let mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL}`, // Put the email address you want to send from
                pass: `${process.env.EMAIL_PASSWORD}` // If you use gmail, you would need to provide a generated password, however,
                // if you have another account that is not gmail, then you can provide the password
            }
        });

        const mailDetails = {
            from: `${process.env.EMAIL}`, // Sender address
            to: email, // List of recipients
            subject: 'Verify your account', // Subject line
            html: `<h1>Welcome to PayFlow Digital Wallet</h1>
                   <p>Click the link below to verify your account:</p>
                   <a href="${process.env.CLIENT_URL}/verify/${verificationToken}">Verify Account</a>
                   <p>If the button does not work for any reason, please copy and paste the link below into your browser:
                    ${process.env.CLIENT_URL}/verify/${verificationToken}


                   ${verificationToken}</p>`
        };
        await mailTransport.sendMail(mailDetails);

        }catch(error){
        console.error({message: "Error in creating mail transport", error});
        }
}

const loginMail = async (email, refreshToken) => {
    try{
        let mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL}`, // Put the email address you want to send from
                pass: `${process.env.EMAIL_PASSWORD}` // If you use gmail, you would need to provide a generated password, however,
                // if you have another account that is not gmail, then you can provide the password
            }
        });

        const mailDetails = {
            from: `${process.env.EMAIL}`, // Sender address
            to: email, // List of recipients
            subject: 'You Logged-In', // Subject line
            html: `<h1>Welcome to PayFlow Digital Wallet</h1>
                   <p>Click the link below to verify your account:</p>
                   <a href="${process.env.CLIENT_URL}/verify/${refreshToken}">Verify Account</a>
                   <p>If the button does not work for any reason, please copy and paste the link below into your browser:
                    ${process.env.CLIENT_URL}/verify/${refreshToken}

                   ${refreshToken}</p>`
        };
        await mailTransport.sendMail(mailDetails);

        }catch(error){
        console.error({message: "Error in creating mail transport", error});
        }
    }

const resetPasswordMail = async (email, resetToken) => {
    try{
        let mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL}`, // Put the email address you want to send from
                pass: `${process.env.EMAIL_PASSWORD}` // If you use gmail, you would need to provide a generated password, however,
                // if you have another account that is not gmail, then you can provide the password
            }
        });

        const mailDetails = {
            from: `${process.env.EMAIL}`, // Sender address
            to: email, // List of recipients
            subject: 'Reset your password', // Subject line
            html: `<h1>Reset your password</h1>
                   <p>Click the link below to reset your password:</p>
                   <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Reset Password</a>
                   <p>If you did not request a password reset, please ignore this email.
                   
                   ${resetToken}</p>`
        };
        await mailTransport.sendMail(mailDetails);

    }catch(error){
        console.error({message: "Error in creating mail transport", error});
    }
}

const transferMail = async (email, amount, sender, receiver) => {
    try{
        let mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL}`, // Put the email address you want to send from
                pass: `${process.env.EMAIL_PASSWORD}` // If you use gmail, you would need to provide a generated password, however,
                // if you have another account that is not gmail, then you can provide the password
            }
        });

        const mailDetails = {
            from: `${process.env.EMAIL}`, // Sender address
            to: email, // List of recipients
            subject: 'Transaction Status', // Subject line
            html: `<h1>Transaction Status Mail</h1>
                   <p>Hi ${sender.fullName},</p>
                   <p>You have successfully sent ${amount} to ${receiver.fullName}.</p>
                   <p>If you did not initiate this transaction, please contact support.</p>                   
                   <p>Thank you for choosing PayFlow Digital Wallet!</p>
                   
                   <p> Hi ${receiver.fullName},</p>
                   <p>Your PayFlow wallet has been credited with ${amount} from ${sender.fullName}.</p>
                   <p> Thank you for choosing PayFlow Digital Wallet!</p>`
        };
        await mailTransport.sendMail(mailDetails);

    }catch(error){
        console.error({message: "Error in creating mail transport", error});
    }
}

const creditWalletMail = async (email, fullName, amount) => {
    try{
        let mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL}`, // Put the email address you want to send from
                pass: `${process.env.EMAIL_PASSWORD}` // If you use gmail, you would need to provide a generated password, however,
                // if you have another account that is not gmail, then you can provide the password
            }
        });

        const mailDetails = {
            from: `${process.env.EMAIL}`, // Sender address
            to: email, // List of recipients
            subject: 'Transaction Status', // Subject line
            html: `<h1>Transaction Status Mail</h1>
                   <p>Hi ${fullName},</p>
                   <p>You have successfully credited your wallet with ${amount} on ${new Date().toLocaleString()}.</p>
                   <p>If you did not initiate this transaction, please contact support.</p>                   
                   <p>Thank you for choosing PayFlow Digital Wallet!</p>`
                
        };
        await mailTransport.sendMail(mailDetails);

    }catch(error){
        console.error({message: "Error in creating mail transport", error});
    }
}



module.exports = {
    verificationMail,
    loginMail,
    resetPasswordMail,
    transferMail,
    creditWalletMail
};

// This module handles sending emails for various notifications in the PayFlow digital wallet system.
// It uses nodemailer to send emails and provides templates for different types of notifications.