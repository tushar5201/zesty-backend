const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    promoCode: String,
    description: String,
    discountPercentage: String,
    discountUpto: String,
    minAmtReq: String
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon; 
