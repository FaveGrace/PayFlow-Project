const sendEmail = require("../Service/notifications");
const User = require("../Models/userSchema");
const Wallet = require("../Models/walletSchema");
const Transaction = require("../Models/transactionSchema"); 



const transfer = async (req, res) => {
    const { receiverId, amount } = req.body;
    const senderId = req.user.id; // Assuming senderId is obtained from the authenticated user

    try {
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

        await sender.save();
        await receiver.save();

        //Save transaction
        const debitTransaction = new Transaction({
            sender: sender._id,
            receiver: receiver._id,
            amount,
            type: 'debit',
            description: `Sent ${amount} to ${receiverId}`,
            timestamp: new Date()
        });
        const creditTransaction = new Transaction({
            sender: sender._id,
            receiver: receiver._id,
            amount,
            type: 'credit',
            description: `Received ${amount} from ${senderId}`,
            timestamp: new Date()
        });

        await debitTransaction.save();
        await creditTransaction.save();

        //send notification email to sender and recipient
        const senderMail = `Hi ${sender.name}, ${amount} has been successfully sent
        to ${receiver.name}. Your new balance is ${sender.wallet.balance}.`
        const receiverMail = `Hi ${receiver.name}, you have received ${amount} from ${sender.name}. 
        Your new balance is ${receiver.wallet.balance}.`

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