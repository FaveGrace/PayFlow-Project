const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {generateAccessToken, generateRefreshToken, generateVerificationToken, generateResetToken} = require('../Service/token');
const {verificationMail, loginMail, resetPasswordMail} = require('../Service/notifications');
const User = require("../Models/userSchema");
const Wallet = require("../Models/walletSchema");


const registerUser = async (req, res) => {
    const { fullName, email, password } = req.body;

    //try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })    
        
        // calling the function for generating the verification token
        const verificationToken = generateVerificationToken(newUser._id);
        newUser.verificationToken = verificationToken;

        const accessToken = generateAccessToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);
        
        await newUser.save();

        const newWallet = new Wallet({
            user: newUser._id,
            balance: 0
        })
        await newWallet.save()

        newUser.wallet = newWallet._id;
        await newUser.save();

        await verificationMail(email, verificationToken);

        res.status(201).json({
            message: "User and wallet created successfully",
            newUser: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                isVerified: newUser.isVerified
                },
            newWallet: {
                id: newWallet._id,
                balance: newWallet.balance
            },
            verificationToken,
            accessToken,
            refreshToken
        })
    
    // }catch(error){
    //     res.status(500).json({message: "Internal server error"});
    // }
}

const verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.VERIFICATION_TOKEN);

        const userId = decoded.id;

        // Find the user by ID
        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: 'Invalid token or user not found' });
        }

        user.isVerified = true;
        user.verificationToken = null; // Clear the verification token after successful verification
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });

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

        if(!user.isVerified){
            return res.status(401).json({message: 'Please verify your email.'}) 
        }

        // Generate JWT token
        const accessToken = generateAccessToken(user?._id);
        const refreshToken = generateRefreshToken(user?._id);

        user.refreshToken = refreshToken;
        await user.save();

        await loginMail(email, refreshToken);

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

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try{
        // Check if user exists
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: 'Email not found!' });
        }

        // Generate reset token
        const resetToken = generateResetToken(user._id);
        // Save reset token and expiry time to user
        user.resetToken = resetToken
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000
        await user.save()    

        await resetPasswordMail(email, resetToken);

        res.status(200).json({ message: 'Reset password email sent!',
            resetToken
         });
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const resetPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body
        try {
            // Check if user exists
            const decoded = jwt.verify(token, process.env.RESET_TOKEN)
            const user = await User.findById(decoded.id);
            if(!user){
                return res.status(400).json({ message: 'Email not found!' });
            }
            if(password.length < 12){
                return res.status(400).json({ message: 'Password must be at least 12 characters long!' });
            }
    
            //Hash password
            const hashedPassword = await bcrypt.hash(password, 12);
            user.password = hashedPassword;

            user.resetToken = null; // Clear reset token
            user.resetTokenExpiry = null; //this is to clear the expiry time of the reset token
            await user.save();
        
            // Respond to client
            res.status(200).json({ message: 'Password reset successfully!' });
        }catch(error){
            res.status(500).json({error})
        }
    }

    const getAllUser = async (req, res) => {
        try{    
        const users = await User.find()


            res.status(200).json(
                {message: "All users found",
                users}
            )
        }catch(error){
            console.error(error);
            res.status(400).json({message: "system error"})
        }
    }



module.exports = {
    registerUser, 
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getAllUser
}