const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Auth, User, Wallet, Transaction} = require('./models'); 
const {generateAccessToken, generateRefreshToken} = require('./utils/token');
const { sendVerificationEmail, sendForgotPasswordEmail, validEmail, sendEmail } = require('./utils/sendMail');
const validateTransaction = require('./middleware/validateTransaction');
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

app.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

        if(!name || !email || !password){
        return res.status(400).json({ message: 'Please fill all fields' });
        }

    try {
        // Validate email
        if(!validEmail(email)){
            return res.status(400).json({ message: 'Invalid email address' });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        })

        await newUser.save()

        const newWallet = new Wallet({
            user: newUser._id,
            balance: 0
        })

        await newWallet.save()

        // calling the function for generating the access token and refresh token
        let accessToken = generateAccessToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);

        accessToken = await jwt.sign(
            { id: newUser._id, email: newUser.email },
            `${process.env.ACCESS_TOKEN}`,
            { expiresIn: '5m' }
        )
        await sendVerificationEmail(email, accessToken);

        res.status(201).json({
            message: "User and wallet created successfully",
            newUser: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            },
            newWallet: {
                id: newWallet._id,
                balance: newWallet.balance
            },
            accessToken,
            refreshToken
        })
    
    }catch(error){
        res.status(500).json({message: "Internal server error"});
    }
})

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: 'Email or Password is incorrect!' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user?.password);
        if(!isMatch){
            return res.status(400).json({ message: 'Email or Password is incorrect!' });
        }

        // Generate JWT token
        const accessToken = generateAccessToken(user?._id);
        const refreshToken = generateRefreshToken(user?._id);
        
        res.status(200).json({
            message: "Login successful",
            user: { 
                id: user._id,
                name: user.name, 
                email: user.email 
            },
            wallet: await Wallet.findOne({ user: user._id }).select('balance'),
            accessToken,
            refreshToken
        })

    }catch(error){
        res.status(500).json({message: "Internal server error"});
    }
})

app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: 'Email not found!' });
        }
        // Generate reset token
        const accessToken = await jwt.sign(
            { id: user._id }, 
            process.env.ACCESS_TOKEN, 
            { expiresIn: '1h' }
        )

        await sendForgotPasswordEmail(email, accessToken);
        res.status(200).json({ message: 'Reset password email sent!' });
})

app.patch("/reset-password", async (req, res) => {
    const {email, password} = req.body;
    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: 'Email not found!' });
        }
        if(!password.length < 12){
            return res.status(400).json({ message: 'Password must be at least 12 characters long!' });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully!' });
    }catch(error){
        res.status(500).json({error})
    }
})

//Money transfer
app.post("/transfer", validateTransaction, async (req, res) => {
    const { senderId, receiverId, amount } = req.body;

    if(!senderId || !receiverId || !amount){
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    try {
        // Check if sender and receiver exist
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if(!sender || !receiver){
            return res.status(400).json({ message: 'Sender or receiver not found!' });
        }
        const senderWallet = await Wallet.findOne({ user: senderId });
        const receiverWallet = await Wallet.findOne({ user: receiverId });

        if(!senderWallet || !receiverWallet){
            return res.status(400).json({ message: 'Sender or receiver not found!' });
        }

        // Check balance
        if(senderWallet.balance < amount){
            return res.status(400).json({ message: 'Insufficient balance!' });
        }

        // Update balances
        senderWallet.balance -= amount;
        receiverWallet.balance += amount;

        await senderWallet.save();
        await receiverWallet.save();

        //Save transaction
        const debitTransaction = new Transaction({
            sender: senderId,
            receiver: receiverId,
            amount: -amount,
            type: 'debit',
            description: `Sent ${amount} to ${receiverId}`,
            timestamp: new Date()
        });
        const creditTransaction = new Transaction({
            sender: senderId,
            receiver: receiverId,
            amount: amount,
            type: 'credit',
            description: `Received ${amount} from ${senderId}`,
            timestamp: new Date()
        });

        await debitTransaction.save();
        await creditTransaction.save();

        //send notification email to sender and recipient
        const senderMail = `Hi ${sender.name}, ${amount} has been successfully sent
        to ${receiver.name}. Your new balance is ${senderWallet.balance}.`
        const receiverMail = `Hi ${receiver.name}, you have received ${amount} from ${sender.name}. 
        Your new balance is ${receiverWallet.balance}.`

        await sendEmail(sender.email, 'Transfer Successful - PayFlow', senderMail);
        await sendEmail(receiver.email, 'Transfer Successful - PayFlow', receiverMail);

        res.status(200).json({
            message: 'Transfer successful!',
            debitTransaction,
            creditTransaction
        });
    }catch(error){
        res.status(500).json({error})
    }
})

//Crediting own wallet
app.post("/wallet/credit-own-wallet", async (req, res) => {
    const { userId, amount } = req.body;

    if(!userId || !amount){
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: 'User not found!' });
        }

        // Check if user exists
        const wallet = await Wallet.findOne({ user: userId });
        if(!wallet){
            return res.status(400).json({ message: 'Wallet not found!' });
        }

        // credit wallet
        wallet.balance += amount;
        await wallet.save();

        // Save transaction
        const transaction = new Transaction({
            sender: userId,
            receiver: userId,
            amount: amount,
            type: 'credit',
            description: `Credited ${amount} to own wallet`,
            timestamp: new Date()
        });

        await transaction.save();

        //send notification email to sender and recipient
        const mailNotification = `Hi ${user.email}, your wallet has been credited with ${amount}.
        Your new balance is ${wallet.balance}.`

        await sendEmail(user.email, 'Wallet Credited - PayFlow', mailNotification);

        res.status(200).json({
            message: 'Wallet credited successfully!',
            wallet
        });
    }catch(error){
        res.status(500).json({error})
    }
})

//Transaction history endpoint
app.get("/transaction-history/:id", async (req, res) => {
    const { id } = req.params;

    //try {
        // Check if user exists
        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({ message: 'User not found!' });
        }

        // Get transactions for the user
        const transactions = await Transaction.find({
            $or: [
                { sender: id },
                { receiver: id }
            ]
        }).sort({ timestamp: -1 });

        res.status(200).json({
            message: 'Transaction history retrieved successfully!',
            transactions
        });
    // }catch(error){
    //     res.status(500).json({error})
    // }
})