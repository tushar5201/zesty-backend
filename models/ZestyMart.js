const mongoose = require("mongoose");

const martSchema = new mongoose.Schema({
    name: String,
    image: { data: Buffer, contentType: String },
    description: String,
    price: String,
    weight: String,
    category: String
});

const ZestyMart = mongoose.model("ZestyMart", martSchema);
module.exports = ZestyMart; 
