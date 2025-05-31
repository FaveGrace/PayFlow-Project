

const validateLoginDetails = (req, res, next) => {

    const {fullName, email, password} = req.body;

    const errors = [];

    if(!email){
        errors.push("Please add your email")
    }
    if(!password){
        errors.push("Please add your password.")
    }
    if(!fullName){
        errors.push("Please add your names.")
    }
    if(errors.length > 0){
        return res.status(400).json({errors})
    }

    next()
}

module.exports = {validateLoginDetails}