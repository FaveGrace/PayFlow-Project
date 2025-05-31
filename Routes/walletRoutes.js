const express = require('express');
const { handleWalletBalance, creditOwnWallet } = require('../Controllers/walletController');
const validateCreditOwnWallet = require('../middleware/validateCreditOwnWallet');

const router = express.Router();

//Wallet Routes
router.get("/view-wallet-balance", handleWalletBalance);
router.post("/wallet/credit-own-wallet", validateCreditOwnWallet, creditOwnWallet);

module.exports = router;