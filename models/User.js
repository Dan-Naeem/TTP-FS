const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    cash: {
        type: Number,
        required: true,
    },
    stocks: [
        {
            tickerSymbol: String,
            numberOfShares: Number,
        }
    ],
    listOfTransactions: [
        {
            transaction: String,
            tickerSymbol: String,
            numberOfShares: Number,
            price: Number,
            date: {
                type: Date,
                default: Date.now,
            }
        }
    ]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;