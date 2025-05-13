const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Auth, User, Wallet} = require('./models'); 
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
*/

app.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

        if(!name || !email || !password){
        return res.status(400).json({ message: 'Please fill all fields' });
        }

    try {
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
            }
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
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user?.password);
        if(!isMatch){
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const accessToken = jwt.sign(
            { id: user?._id },
             process.env.ACCESS_TOKEN, 
             { expiresIn: '5m' }
        );

        const refreshToken = jwt.sign(
            {id: user?._id},
            process.env.REFRESH_TOKEN,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            message: "Login successful",
            accessToken,
            user: { 
                id: user._id,
                name: user.name, 
                email: user.email 
            },
            wallet: await Wallet.findOne({ user: user._id }).select('balance'),
            refreshToken
        })

    }catch(error){
        res.status(500).json({message: "Internal server error"});
    }
})