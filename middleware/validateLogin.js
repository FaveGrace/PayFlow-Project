

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Please add your email.');
  if (!password) errors.push('Please add your password.');

  if (errors.length > 0) {
    return res.status(400).json({ message: errors });
  }

  next();
};

module.exports = {validateLogin}