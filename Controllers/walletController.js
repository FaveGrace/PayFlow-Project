const Wallet = require("../Models/walletSchema");
const Transaction = require("../Models/transactionSchema")
const creditWalletMail = require("../Service/notifications");

const handleWalletBalance = async (req, res) => {
    
    const wallet = await Wallet.findOne({user: req.user._id});

    if(!wallet){
        return res.status(404).json({message: 'Wallet not found.'})
    }

    res.status(200).json({
        message: 'Here is your wallet balance.', 
        balance: wallet.balance
    })
}

const creditOwnWallet = async (req, res) => {
    const { amount} = req.body;

    //try {
        const sender = req.user;
        // Check if user exists
        const wallet = await Wallet.findOne({ user: sender._id });
        if(!wallet){
            return res.status(400).json({ message: 'Wallet not found!' });
        }

        // Check if amount is valid
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount!' });
        }

        // credit wallet
        wallet.balance += amount;
        await wallet.save();

        // Save transaction
        const transaction = new Transaction({
            sender: sender._id,
            receiver: sender._id, // Since it's own wallet, receiver is the same as sender
            amount: amount,
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
            amount: amount,
            wallet
        });
    // }catch(error){
    //     res.status(500).json({error})
    // }
}

module.exports = {
    handleWalletBalance,
    creditOwnWallet
}