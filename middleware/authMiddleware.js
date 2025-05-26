const jwt = require("jsonwebtoken")

const auth = async (req, res, next) => {

    const token = req.headers("Authorization")

    if(!token){
        return res.status(401).json({message: "Please login!"})
    }

    const splitToken = token.split(" ")

    const realToken = splitToken[1]

    const decoded = jwt.verify(realToken, `${process.env.ACCESS_TOKEN}`)
    if(!decoded){
        return res.status(401).json({message: "Please login"})
    }

    // const user = await Auth.findById(decoded.id)
    // if(!user){
    //     return res.status(404).json({message: "User account does not exist"})
    // }

    req.user = decoded

    next()

    

}

module.exports = {auth}