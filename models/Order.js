const { mongoose } = require("mongoose");

const orderSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurants"
    },
    restaurantName: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    order: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menus"
        },
        quantity: String
    }],
    totalAmountUser: String,
    totalAmountRestaurant: {
        type: String,
        default: "0"
    },
    coupon: String,
    paymentMode: String,
    orderStatus: {
        type: String,
        default: "Pending"
    }
}, { timestamps: true });

const Order = mongoose.model("Orders", orderSchema);
module.exports = Order;