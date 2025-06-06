const express = require('express');
const { validateTransfer } = require('../middleware/validateTransfer');
const { transfer, transactionHistoryById } = require('../Controllers/transactionController');
const { validateTransactionHistory } = require('../middleware/validateTransactionHistory');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

//Transaction Routes
router.post("/wallet/transfer", auth, validateTransfer, transfer);
router.get("/get-transaction", auth, validateTransactionHistory, transactionHistoryById);

module.exports = router;