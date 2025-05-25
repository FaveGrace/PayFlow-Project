

const validateTransactionHistory = (req, res, next) => {
  const { id } = req.params;
  const errors = [];

  if (!id) errors.push('User ID is required.');

  if (errors.length > 0) {
    return res.status(400).json({ message: errors });
  }

  next();
};

module.exports = {validateTransactionHistory}