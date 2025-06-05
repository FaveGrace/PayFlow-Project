

const validateCreditOwnWallet = (req, res, next) => {
  const { amount } = req.body;
  const errors = [];

  if (!amount || isNaN(amount) || amount <= 0) errors.push('Amount must be greater than 0.');

  if (errors.length > 0) {
    return res.status(400).json({ message: errors });
  }

  next();
};

module.exports = validateCreditOwnWallet;