const Wallet = require("../Models/walletSchema");
const Transaction = require("../Models/transactionSchema")
const creditWalletMail = require("../Service/notifications");

const handleWalletBalance = async (req, res) => {
    try{
        const userId = req.user._id;
        const wallet = await Wallet.findOne({ user: userId });

        if(!wallet){
            return res.status(404).json({message: 'Wallet not found.'})
        }

        res.status(200).json({
            message: 'Here is your wallet balance.', 
            balance: wallet.balance,
            wallet: {
                id: wallet._id,
                balance: wallet.balance,
                user: wallet.user
            }
        });
    }catch(error){
        console.error('Wallet balance error:', error);
        res.status(500).json({message: "Internal server error"});
    }
}

const creditOwnWallet = async (req, res) => {
    const { amount} = req.body;

    try {
        const sender = req.user;
        // Check if user exists
        const wallet = await Wallet.findOne({ user: sender.id });
        if(!wallet){
            return res.status(400).json({ message: 'Wallet not found!' });
        }

        // Check if amount is valid
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount!' });
        }

        // credit wallet
        wallet.balance += (wallet.balance || 0) + parseFloat(amount);//handles null balance
        await wallet.save();

        // Save transaction
        const transaction = new Transaction({
            sender: sender.id,
            receiver: sender.id, // Since it's own wallet, receiver is the same as sender
            amount: parseFloat(amount),
            type: 'credit',
            balance: wallet.balance,
            description: `Credited ${amount} to own wallet`,
            timestamp: new Date()
        });

        await transaction.save();

        //send notification email to sender and recipient
        await creditWalletMail(sender.email, sender.fullName, amount);

        res.status(200).json({
            message: 'Wallet credited successfully!',
            amount: parseFloat(amount),
            newBalance: wallet.balance,
            wallet: {
                id: wallet._id,
                balance: wallet.balance,
                user: wallet.user
            }
        });
    }catch(error){
        console.error('Credit wallet error:', error);
        res.status(500).json({message: 'Internal server error'})
    }
}

module.exports = {
    handleWalletBalance,
    creditOwnWallet
}