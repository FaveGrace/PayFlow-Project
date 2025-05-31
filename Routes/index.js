const authRoutes = require('../Routes/authRoutes');
const transactionRoutes = require('../Routes/transactionRoutes');
const walletRoutes = require('../Routes/walletRoutes')

const router = [
    authRoutes,
    transactionRoutes,
    walletRoutes
]

module.exports = router;