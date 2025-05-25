const User = require("../Models/userSchema");
const {sendForgotPasswordEmail, validEmail} = require('../utils/notifications');
const bcrypt = require('bcryptjs');

const forgotPassword = async (req, res) => {
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
    }

const resetPassword = async (req, res) => {
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
    }


module.exports = {
    forgotPassword,
    resetPassword
}