const mongoose = require("mongoose");

const martSchema = new mongoose.Schema({
    name: String,
    // images: [{ data: Buffer, contentType: String }],
    images: [{ type: String }],
    description: String,
    price: String,
    weight: String,
    category: String
});

const ZestyMart = mongoose.model("ZestyMart", martSchema);
module.exports = ZestyMart; 
