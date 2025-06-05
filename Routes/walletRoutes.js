const express = require('express');
const { handleWalletBalance, creditOwnWallet } = require('../Controllers/walletController');
const validateCreditOwnWallet = require('../middleware/validateCreditOwnWallet');
const {auth} = require('../middleware/authMiddleware');

const router = express.Router();

//Wallet Routes
router.get("/view-wallet-balance", auth, handleWalletBalance);
router.post("/wallet/credit-own-wallet", auth, validateCreditOwnWallet, creditOwnWallet);

module.exports = router;