const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { registerUser, loginUser } = require('./Controllers/authController');
const { forgotPassword, resetPassword } = require('./Controllers/userController');
const { transfer, creditOwnWallet, transactionHistory } = require('./Controllers/transactionController');
const { validateLoginDetails } = require('./middleware/validateRegistration');
const { validateLogin } = require('./middleware/validateLogin');
const { validateCreditOwnWallet } = require('./middleware/validateCreditOwnWallet');
const { validateTransactionHistory } = require('./middleware/validateTransactionHistory');
const { validateTransfer } = require('./middleware/validateTransfer');
dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 7080;

mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})

/*
Fintech Digital Wallet System (PayFlow)
Build a backend for a simple digital wallet system where users can register, log in, and send
money to other users.
Main Features:
- User registration and login (JWT)
- Wallet auto-created on registration
- Money transfer between users
- View wallet balance and transactions
Schemas:
1. User name, email, password, wallet reference
2. Wallet user reference, balance
3. Transaction sender, receiver, amount, type, timestamp
Endpoints:
- POST /auth/register
- POST /auth/login
- GET /wallet
- POST /wallet/transfer
- GET /transactions

    Milestone 1: User Authentication & Wallet Setup
1.Implement user registration and login with JWT.
2. Auto-create a wallet on user registration.
3.Setup MongoDB schemas: User and Wallet.

Milestone 2: Money Transfers
1.Add money transfer logic between wallets.
2.Create Transaction schema to log each transfer.
3.Validate balances before transfers.
*/

app.post('/auth/register', validateLoginDetails, registerUser)

app.post('/auth/login',validateLogin, loginUser)

app.post("/forgot-password", validateLoginDetails, forgotPassword)

app.patch("/reset-password", validateLoginDetails, resetPassword)

//Money transfer
app.post("/transfer", validateTransfer, transfer)

//Crediting own wallet
app.post("/wallet/credit-own-wallet", validateCreditOwnWallet, creditOwnWallet)

//Transaction history endpoint
app.get("/transaction-history/:id", validateTransactionHistory, transactionHistory)