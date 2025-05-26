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

module.exports = {
    generateAccessToken,
    generateRefreshToken
};