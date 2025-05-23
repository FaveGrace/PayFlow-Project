// Middleware to validate transaction amount
const validateTransaction = (req, res, next) => {
    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
    }
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    next();
}

module.exports = validateTransaction;