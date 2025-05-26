const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: "user"
    }
}, { timestamps: true});

const Auth = new mongoose.model("Auth", authSchema)

module.exports = Auth