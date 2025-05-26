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
     await mailTransport .sendMail({
        from: `${process.env.EMAIL}`,
        to: `${email}`,
        subject,
        text: text
    })
   }catch(error){
       console.log({message: "Email sending failed", error});
   }
}

//Notification templates
const templates = {
    verification: (token) => `
        <h1>Verify your email</h1>
        <p>Here is your verification token: ${token}, please click the button
        to verify your email.</p>
        <a href="https://www.payflow.com/verify-email/${token}">Click here to verify your email</a>
        <p>If the button does not work, please copy and paste the link below into your browser:</p>
        <p>${token}</p>
    `,
    resetPassword: (token) => `
        <h1>Reset your password</h1>
        <p>Here is your password reset token: ${token}, please click on the button to
        reset your password.</p>
        <a href="https://www.payflow.com/reset-password/${token}">Click here to reset your password</a>
        <p>If the button does not work, please copy and paste the link below into your browser:</p>
        <p>${token}</p>
    `,
    loginNotification: (accessToken, refreshToken) => `
        <h1>Login Notification</h1>
        <p>You have successfully logged in to your account.</p>
        <p>Your access token is: ${accessToken()}</p>
        <p>Your refresh token is: ${refreshToken()}</p>
    `,
    passwordResetSuccess: (accessToken, refreshToken) => `
        <h1>Password Reset Successful</h1>
        <p>Your password has been successfully reset.</p>
        <p>Your new access token is: ${accessToken()}</p>
        <p>Your new refresh token is: ${refreshToken()}</p>
    `,
    transferNotification: (senderId, receiverId, amount) => `
        <h1>Money Transfer Notification</h1>
        <p>${senderId} has sent ${receiverId} an amount of ${amount}.</p>
        <p>Thank you for using PayFlow!</p>
    `, 
    transferFailure: (senderId, amount) => `
        <h1>Transfer Failed</h1>
        <p>${senderId},  transaction of amount of ${amount} failed.</p>
        <p>Please check your balance and try again.</p>
    `,
    creditOwnWallet: (userId, amount) => `
        <h1>Credit Wallet Notification</h1>
        <p>${userId}, amount credited successfully: ${amount}.</p>
        <p>Thank you for using PayFlow!</p>
    `,
    creditOwnWalletFailure: (userId, amount) => `
        <h1>Credit Wallet Failed</h1>
        <p>${userId}, transaction of amount ${amount} failed.</p>
        <p>Please check your balance and try again.</p>
    `,
    transactionHistory: (transactions) => `
        <h1>Transaction History</h1>
        <p>Here is your transaction history:</p>
        <ul>
            ${transactions.map(transaction => 
                `<li>${transaction.sender} sent ${transaction.receiver} an amount of ${transaction.amount} on ${transaction.timestamp}</li>`).join('')}
        </ul>
    `,
    transactionHistoryFailure: (userId) => `
        <h1>Transaction History Failed</h1>
        <p>${userId}, transaction history could not be retrieved.</p>
        <p>Please try again later.</p>
    `
};

module.exports = {
    sendEmail,
    templates
};

// This module handles sending emails for various notifications in the PayFlow digital wallet system.
// It uses nodemailer to send emails and provides templates for different types of notifications.