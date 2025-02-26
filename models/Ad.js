const { default: mongoose } = require("mongoose");

const adSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    },
    // image: { data: Buffer, contentType: String }
    image: String
});

const Ad = mongoose.model("Ads", adSchema);
module.exports = Ad; 
