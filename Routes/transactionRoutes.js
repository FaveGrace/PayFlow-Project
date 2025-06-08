const express = require('express');
const { validateTransfer } = require('../middleware/validateTransfer');
const { transfer, transactionHistory, transactionById } = require('../Controllers/transactionController');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

//Transaction Routes
router.post("/wallet/transfer", auth, validateTransfer, transfer);
router.get("/get-transaction", auth, transactionHistory);
router.get("/get-transaction/:transactionId", auth, transactionById);


module.exports = router;