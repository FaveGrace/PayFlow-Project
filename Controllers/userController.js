const { auth } = require("../middleware/authMiddleware");
const User = require("../Models/userSchema");
const {sendEmail, templates} = require('../Service/notifications');
const bcrypt = require('bcryptjs');

const forgotPassword = async (req, res) => {
    const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: 'Email not found!' });
        }
        // Generate reset token
        const accessToken = generateAccessToken(newUser._id);      

        await sendEmail(email, "Reset Password", templates.resetPassword(accessToken));
        res.status(200).json({ message: 'Reset password email sent!' });
    }

const resetPassword = async (req, res) => {
    const {email, token, password} = req.body;
        try {
            // Check if user exists
            const user = await User.findById({ email: req.user.email });
            if(!user){
                return res.status(400).json({ message: 'Email not found!' });
            }
            if(!password.length < 12){
                return res.status(400).json({ message: 'Password must be at least 12 characters long!' });
            }
    
            //Hash password
            const hashedPassword = await bcrypt.hash(password, 12);
            auth.password = hashedPassword;
            await auth.save();

            user.resetToken = null; // Clear reset token
            user.resetTokenExpiry = null; //this is to clear the expiry time of the reset token
            await user.save();

            const accessToken = generateAccessToken(user._id); // Generate new access token
            const refreshToken = generateRefreshToken(user._id); // Generate new refresh token

            auth.accessToken = accessToken;
            auth.refreshToken = refreshToken;
            await auth.save();

            // Send confirmation email
            await sendEmail(email, "Password Reset Confirmation", templates.passwordResetConfirmation(user.fullName));
            
            // Respond to client
            res.status(200).json({ message: 'Password reset successfully!' });
        }catch(error){
            res.status(500).json({error})
        }
    }


module.exports = {
    forgotPassword,
    resetPassword
}