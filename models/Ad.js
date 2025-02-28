const { default: mongoose } = require("mongoose");

const adSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurants"
    },
    // image: { data: Buffer, contentType: String }
    image: String
});

const Ad = mongoose.model("Ads", adSchema);
module.exports = Ad; 
