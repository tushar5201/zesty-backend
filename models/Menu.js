const { default: mongoose } = require("mongoose");

const menuScheme = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    },
    name: String,
    price: String,
    description: String,
    foodType: String,
    category: String,
    packagingCharge: String,
    variant: {
        small: {
            price: String,
            quantity: String
        },
        medium: {
            price: String,
            quantity: String
        },
        large: {
            price: String,
            quantity: String
        }
    },
    addOnes: [{
        name: String,
        price: String
    }],
    image: String
});

const Menu = mongoose.model("Menus", menuScheme);
module.exports = Menu; 
