const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
    return jwt.sign({id: userId }, 
        process.env.ACCESS_TOKEN, 
        { expiresIn: "5h" });
}

const generateRefreshToken = (userId) => {
    return jwt.sign({id: userId }, 
        process.env.REFRESH_TOKEN, 
        { expiresIn: "30d" });
}

const generateVerificationToken = (userId) => {
    return jwt.sign({id: userId},
        process.env.VERIFICATION_TOKEN,
        {expiresIn: '1d'}
    )
}

const generateResetToken = (userId) => {
    return jwt.sign({id: userId},
        process.env.RESET_TOKEN,
        {expiresIn: '15m'}
    )
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateVerificationToken,
    generateResetToken
};