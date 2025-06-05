// Middleware to validate transaction amount

const validateTransfer = (req, res, next) => {
    const {senderId, receiverEmail, amount} = req.body
    
    const errors = [];

    if(!senderId){
        errors.push("Please input the senderId")
    }
    if(!receiverEmail){
        errors.push("Please input the receiverEmail")
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