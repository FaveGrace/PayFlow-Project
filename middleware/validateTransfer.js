// Middleware to validate transaction amount

const validateTransfer = (req, res, next) => {
    const {senderId, receiverId, userId, amount} = req.body
    
    const errors = [];

    if(!senderId || userId){
        errors.push("Please input the senderId or userId")
    }
    if(!receiverId || userId){
        errors.push("Please input the receiverId or userId")
    }
    if(!amount || isNaN(amount) || amount <= 100){
        errors.push("Please make transactions of 100 Naira and above.")
    }
    if(errors.length > 0){
        return res.status(400).json({message: errors})
    }

    next();
}

module.exports = {validateTransfer}
/*
    const validateTransaction = (req, res, next) => {
    const { senderId, receiverId, amount, userId } = req.body;

    const errors = [];

    if (!senderId || !userId) {
        errors.push("Please input sender Id or user Id")
    }
    if (!receiverId || !userId) {
        errors.push("Please input receiver Id or user Id")
    }
    if (!amount || isNaN(amount) || amount <= 100) {
        errors.push("Please make transactions of 100 Naira and above.")
    };
    if(errors.length > 0){
        return res.status(400).json({message: errors})
    }

    next();
}


*/