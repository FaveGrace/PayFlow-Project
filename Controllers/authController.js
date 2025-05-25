const Auth = require("../Models/authSchema");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {generateAccessToken, generateRefreshToken} = require('../utils/token');
const { sendVerificationEmail} = require('../utils/notifications');


const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await Auth.findOne({ email });
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
}

const loginUser = async (req, res) => {
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
}

module.exports = {
    registerUser, 
    loginUser,
}