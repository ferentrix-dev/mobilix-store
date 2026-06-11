const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    surname: String,
    name: String,
    middleName: String,
    phone: String,

    city: String,
    warehouse: String,

    paymentMethod: String,
    comment: String,

    items: String,
    total: Number,
    cart: Array,

    status: {
        type: String,
        default: "new"
    },

    telegramSent: {
        type: Boolean,
        default: false
    },

    telegramError: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);