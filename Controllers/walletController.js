const Wallet = require("../Models/walletSchema");
const Transaction = require("../Models/transactionSchema")

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

    try {
        // Check if user exists
        const wallet = await Wallet.findOne({ user: userId });
        if(!wallet){
            return res.status(400).json({ message: 'Wallet not found!' });
        }

        // credit wallet
        wallet.balance += amount;
        await wallet.save();

        // Save transaction
        const transaction = new Transaction({
            sender: userId,
            receiver: userId,
            amount: amount,
            type: 'credit',
            description: `Credited ${amount} to own wallet`,
            timestamp: new Date()
        });

        await transaction.save();

        //send notification email to sender and recipient
        await sendEmail(user.email, `Hi ${user.email}, your wallet has been credited with ${amount}.
        Your new balance is ${wallet.balance}. - PayFlow`);

        res.status(200).json({
            message: 'Wallet credited successfully!',
            wallet
        });
    }catch(error){
        res.status(500).json({error})
    }
}

module.exports = {
    handleWalletBalance,
    creditOwnWallet
}