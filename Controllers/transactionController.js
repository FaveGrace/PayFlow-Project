const sendEmail = require("../utils/notifications");
const User = require("../Models/userSchema");
const Wallet = require("../Models/walletSchema");
const Transaction = require("../Models/transactionSchema"); 



const transfer = async (req, res) => {
    const { senderId, receiverId, amount } = req.body;

    try {
        // Check if sender and receiver exist
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if(!sender || !receiver){
            return res.status(400).json({ message: 'Sender or receiver not found!' });
        }
        const senderWallet = await Wallet.findOne({ user: senderId });
        const receiverWallet = await Wallet.findOne({ user: receiverId });

        if(!senderWallet || !receiverWallet){
            return res.status(400).json({ message: 'Sender or receiver not found!' });
        }

        // Check balance
        if(senderWallet.balance < amount){
            return res.status(400).json({ message: 'Insufficient balance!' });
        }

        // Update balances
        senderWallet.balance -= amount;
        receiverWallet.balance += amount;

        await senderWallet.save();
        await receiverWallet.save();

        //Save transaction
        const debitTransaction = new Transaction({
            sender: senderId,
            receiver: receiverId,
            amount: -amount,
            type: 'debit',
            description: `Sent ${amount} to ${receiverId}`,
            timestamp: new Date()
        });
        const creditTransaction = new Transaction({
            sender: senderId,
            receiver: receiverId,
            amount: amount,
            type: 'credit',
            description: `Received ${amount} from ${senderId}`,
            timestamp: new Date()
        });

        await debitTransaction.save();
        await creditTransaction.save();

        //send notification email to sender and recipient
        const senderMail = `Hi ${sender.name}, ${amount} has been successfully sent
        to ${receiver.name}. Your new balance is ${senderWallet.balance}.`
        const receiverMail = `Hi ${receiver.name}, you have received ${amount} from ${sender.name}. 
        Your new balance is ${receiverWallet.balance}.`

        await sendEmail(sender.email, 'Transfer Successful - PayFlow', senderMail);
        await sendEmail(receiver.email, 'Transfer Successful - PayFlow', receiverMail);

        res.status(200).json({
            message: 'Transfer successful!',
            debitTransaction,
            creditTransaction
        });
    }catch(error){
        res.status(500).json({error})
    }
}

const creditOwnWallet = async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: 'User not found!' });
        }

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
        const mailNotification = `Hi ${user.email}, your wallet has been credited with ${amount}.
        Your new balance is ${wallet.balance}.`

        await sendEmail(user.email, 'Wallet Credited - PayFlow', mailNotification);

        res.status(200).json({
            message: 'Wallet credited successfully!',
            wallet
        });
    }catch(error){
        res.status(500).json({error})
    }
}

const transactionHistory = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if user exists
        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({ message: 'User not found!' });
        }

        // Get transactions for the user
        const transactions = await Transaction.find({
            $or: [
                { sender: id },
                { receiver: id }
            ]
        }).sort({ timestamp: -1 });

        res.status(200).json({
            message: 'Transaction history retrieved successfully!',
            transactions
        });
    }catch(error){
        res.status(500).json({error})
    }
}

module.exports = {
    transfer,
    creditOwnWallet,
    transactionHistory
}