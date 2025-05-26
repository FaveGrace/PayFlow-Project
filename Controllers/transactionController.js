const sendEmail = require("../Service/notifications");
const User = require("../Models/userSchema");
const Wallet = require("../Models/walletSchema");
const Transaction = require("../Models/transactionSchema"); 



const transfer = async (req, res) => {
    const { receiverId, amount, description } = req.body;
    const senderId = req.user.id; // Assuming senderId is obtained from the authenticated user

    try {
        // Check if sender and receiver exist
        const sender = await User.findById(senderId).populate('wallet');
        const receiver = await User.findOne({ email: receiverEmail }).populate('wallet');
        if(!sender || !receiver){
            return res.status(400).json({ message: 'Sender or receiver not found!' });
        }
            // const senderWallet = await Wallet.findOne({ user: senderId });
            // const receiverWallet = await Wallet.findOne({ user: receiverId });

            // if(!senderWallet || !receiverWallet){
            //     return res.status(400).json({ message: 'Sender or receiver not found!' });
            // }

        // Check balance
        if(sender.wallet.balance < amount){
            return res.status(400).json({ message: 'Insufficient balance!' });
        }

        // Update balances
        sender.wallet.balance -= amount;
        receiver.wallet.balance += amount;

        await senderWallet.save();
        await receiverWallet.save();

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

        await sendEmail(sender.email, 'Transfer Successful - PayFlow', senderMail, sendEmail.templates.transferNotification);
        await sendEmail(receiver.email, 'Transfer Successful - PayFlow', receiverMail, sendEmail.templates.transferNotification);

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

        await sendEmail(user.email, 'Wallet Credited - PayFlow', creditOwnWallet);

        res.status(200).json({
            message: 'Wallet credited successfully!',
            wallet
        });
    }catch(error){
        res.status(500).json({error})
    }
}

const transactionHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        // Get transactions for the user
        const transactions = await Transaction.find({
            $or: [
                { sender: userId },
                { receiver: userId }
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