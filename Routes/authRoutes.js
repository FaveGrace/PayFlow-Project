const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, verifyEmail } = require('../Controllers/authController');
const { validateLoginDetails } = require('../middleware/validateLoginDetails');
const { validateLogin } = require('../middleware/validateLogin');
const { auth } = require('../middleware/authMiddleware');
const { validateEmailVerification } = require('../middleware/validateEmailVerification');

const router = express.Router();

//Auth Routes
router.post('/auth/register', validateLoginDetails, registerUser);
router.post('/auth/login', validateLogin, loginUser);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password", auth, resetPassword);
router.get("/verify-email/:token", validateEmailVerification, verifyEmail);



module.exports = router;