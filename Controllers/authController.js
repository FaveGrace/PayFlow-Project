const Auth = require("../Models/authSchema");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {generateAccessToken, generateRefreshToken} = require('../Service/token');
const { sendEmail, templates} = require('../Service/notifications');
const User = require("../Models/userSchema");
const Wallet = require("../Models/walletSchema");


const registerUser = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await Auth.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            verificationToken,
            isVerified: false
        })

        await newUser.save()

        const newWallet = new Wallet({
            user: newUser._id,
            balance: 0
        })

        await newWallet.save()

        // calling the function for generating the access token and refresh token
        const accessToken = generateAccessToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);

        await sendEmail(email, "Verify your account", 
            templates.verification(newUser.fullName, verificationToken));

        res.status(201).json({
            message: "User and wallet created successfully",
            newUser: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                isVerified: newUser.isVerified,
                verificationToken: newUser.verificationToken
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

        user.refreshToken = refreshToken;
        await user.save();

        await sendEmail(email, "Login Notification",
            templates.loginNotification(accessToken, refreshToken));
        
        // Return response
        if(!user.isVerified){
            return res.status(403).json({ message: 'Please verify your account first!' });
        }

        res.status(200).json({
            message: "Login successful",
            user: { 
                id: user._id,
                fullName: user.fullName,
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

const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({ verificationToken: token });
        if(!user){
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    }catch(error){
        res.status(500).json({message: "Internal server error"});
    }
}

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if(!refreshToken){
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        const user = await User.findOne({ refreshToken });
        if(!user){
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
        const userId = decoded.id;

        // Generate new access token
        const accessToken = generateAccessToken(userId);
        // Generate new refresh token
        const newRefreshToken = generateRefreshToken(userId);

        user.refreshToken = newRefreshToken;
        await user.save();
        await sendEmail(user.email, "Token Refresh Notification",
            templates.tokenRefreshNotification(accessToken, newRefreshToken));


        res.status(200).json({ accessToken });
    }catch(error){
        res.status(500).json({message: "Internal server error"});
    }
}

// const handleGetAllUser = async (req, res) => {
//     const allUsers = await User.find();

//     res.status(200).json({
//         message: "All users found",
//         allUsers
//     })
// }

module.exports = {
    registerUser, 
    loginUser,
    verifyEmail,
    refreshToken
    // handleGetAllUser
}