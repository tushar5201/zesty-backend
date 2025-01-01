const { default: mongoose } = require("mongoose");

const menuScheme = new mongoose.Schema({
    restaurantId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Restaurant"
    },
    name: String,
    price: String,
    description: String,
    category: String,
    image: { data: Buffer, contentType: String }
});

const Menu = mongoose.model("Menus", menuScheme);
module.exports = Menu; 
