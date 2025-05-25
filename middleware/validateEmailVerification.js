

const validateEmailVerification = (req, res, next) => {
  const { token } = req.params;
  const errors = [];

  if (!token) errors.push('Verification token is required.');

  if (errors.length > 0) {
    return res.status(400).json({ message: errors });
  }

  next();
};

module.exports = {validateEmailVerification}