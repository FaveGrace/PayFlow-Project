const sendEmail = require("../Service/notifications");
const User = require("../Models/userSchema");
const Wallet = require("../Models/walletSchema");
const Transaction = require("../Models/transactionSchema"); 
const transferMail = require("../Service/notifications").transferMail;



const transfer = async (req, res) => {
    const { receiverEmail, amount } = req.body;
    const senderId = req.user.id; // Assuming senderId is obtained from the authenticated user

    //try {

        // Validate input
        if(!receiverEmail || !amount || amount <= 0){
            return res.status(400).json({ message: 'Invalid input!' });
        }
        // Check if sender and receiver exist
        const sender = await User.findById(senderId).populate('wallet');
        const receiver = await User.findOne({ email: receiverEmail }).populate('wallet');
        if(!sender || !receiver){
            return res.status(400).json({ message: 'Sender or receiver not found!' });
        }

        // Check balance
        if(sender.wallet.balance < amount){
            return res.status(400).json({ message: 'Insufficient balance!' });
        }

        // Update balances
        sender.wallet.balance -= amount;
        receiver.wallet.balance += amount;

        await sender.wallet.save();
        await receiver.wallet.save();

        //Save transaction
        const debitTransaction = new Transaction({
            sender: sender._id,
            receiver: receiver._id,
            amount,
            balance: sender.wallet.balance,
            type: 'debit',
            description: `Sent ${amount} to ${receiver.email}`,
            timestamp: new Date()
        });
        const creditTransaction = new Transaction({
            sender: sender._id,
            receiver: receiver._id,
            amount,
            balance: receiver.wallet.balance,
            type: 'credit',
            description: `Received ${amount} from ${sender.email}`,
            timestamp: new Date()
        });

        await debitTransaction.save();
        await creditTransaction.save();

        //send notification email to sender and recipient
        await transferMail(receiver.email, amount, sender, receiver);
        await transferMail(sender.email, amount, sender, receiver);

        res.status(200).json({
            message: 'Transfer successful!',
            debitTransaction,
            creditTransaction
        });
    // }catch(error){
    //     res.status(500).json({error})
    // }
}

const transactionHistoryById = async (req, res) => {
    const userId = req.user.id;

    try {
        // Get transactions for the user
        const transactions = await Transaction.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).sort({ timestamp: -1 });

        await sendEmail(email, 'Transaction History')

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
    transactionHistoryById
}