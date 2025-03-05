const { default: mongoose } = require("mongoose");

const menuScheme = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurants"
    },
    name: String,
    price: String,
    description: String,
    foodType: String,
    category: String,
    packagingCharge: String,
    image: String
});

const Menu = mongoose.model("Menus", menuScheme);
module.exports = Menu; 
