const sendEmail = require("../Service/notifications");
const User = require("../Models/userSchema");
const Wallet = require("../Models/walletSchema");
const Transaction = require("../Models/transactionSchema"); 
const transferMail = require("../Service/notifications").transferMail;



const transfer = async (req, res) => {
    const { receiverEmail, amount } = req.body;
    const senderId = req.user.id; // Assuming senderId is obtained from the authenticated user

    try {

        // Validate input
        if(!receiverEmail || !amount || amount <= 0){
            return res.status(400).json({ message: 'Invalid input!' });
        }

        const transferAmount = parseFloat(amount);

        // Check if sender and receiver exist
        const sender = await User.findById(senderId);
        const receiver = await User.findOne({ email: receiverEmail });

        if(!sender || !receiver){
            return res.status(400).json({ message: 'Sender or receiver not found!' });
        }

        //for better control, find wallets separately
        const senderWallet = await Wallet.findOne({user: senderId});
        const receiverWallet = await Wallet.findOne({user: receiver._id});

        if(!senderWallet || !receiverWallet){
            return res.status(400).json({message: 'Wallet not found for sender nor receiver.'});
        }

        // Check balance
        const senderBalance = senderWallet.balance || 0;
        if(senderBalance < transferAmount){
            return res.status(400).json({ 
                message: 'Insufficient balance!',
                currentBalance: senderBalance,
                requiredAmount: transferAmount 
            });
        }

        // Update balances
        senderWallet.balance = senderBalance - transferAmount;
        receiverWallet.balance = (receiverWallet.balance || 0) + transferAmount;

        await senderWallet.save();
        await receiverWallet.save();

        //Save transaction
        const debitTransaction = new Transaction({
            sender: sender._id,
            receiver: receiver._id,
            amount: transferAmount,
            balance: senderWallet.balance,
            type: 'debit',
            description: `Sent ${amount} to ${receiver.email}`,
            timestamp: new Date()
        });
        const creditTransaction = new Transaction({
            sender: sender._id,
            receiver: receiver._id,
            amount: transferAmount,
            balance: receiverWallet.balance,
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
            senderNewBalance: senderWallet.balance,
            receiverNewBalance: receiverWallet.balance,
            debitTransaction,
            creditTransaction
        });
    }catch(error){
        console.error('Transfer error:', error);
        res.status(500).json({message: 'Internal server error'})
    }
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
        }).sort({ timestamp: -1 })
        .populate('sender', 'fullName email')
        .populate('receiver', 'fullName email')
        .sort({createdAt: -1});        

        res.status(200).json({
            message: 'Transaction history retrieved successfully!',
            count: transactions.length,
            transactions
        });
    }catch(error){
        console.error('Transaction history error:', error);
        res.status(500).json({message: 'Internal server error'})
    }
}

module.exports = {
    transfer,
    transactionHistoryById
}