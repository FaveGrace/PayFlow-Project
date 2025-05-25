

const validateCreditOwnWallet = (req, res, next) => {
  const { userId, amount } = req.body;
  const errors = [];

  if (!userId) errors.push('User ID is required.');
  if (!amount || isNaN(amount) || Number(amount) <= 0) errors.push('Amount must be greater than 0.');

  if (errors.length > 0) {
    return res.status(400).json({ message: errors });
  }

  next();
};

module.exports = {validateCreditOwnWallet}