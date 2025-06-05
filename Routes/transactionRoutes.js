const express = require('express');
const { validateTransfer } = require('../middleware/validateTransfer');
const { transfer, transactionHistoryById } = require('../Controllers/transactionController');
const { validateTransactionHistory } = require('../middleware/validateTransactionHistory');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

//Transaction Routes
router.post("/transfer", auth, validateTransfer, transfer);
router.get("/get-transaction/:id", validateTransactionHistory, transactionHistoryById);

module.exports = router;