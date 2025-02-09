const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const restaurantSchema = new mongoose.Schema(
    // ownerFullName: String,
    // restaurantName: String,
    // email: String,
    // password: String,
    // workingDays: [String], //monday, tuesday, ...
    // timings: String, //9.00AM to 9.00PM
    // phone: String,
    // location: String,
    // bankAC: String,
    // totalEarnings: String,
    // menu: [{
    //     image: { data: Buffer, contentType: String },
    //     name: String,
    //     price: String,
    //     description: String,
    //     category: String
    // }]

    {
        ownerName: String,
        restaurantName: String,
        pincode: String,
        shopNumber: String,
        floor: String,
        buildingName: String,
        selectedArea: String,
        city: String,
        state: String,
        email: String,
        mobile: String,
        workingDays: [
            String
        ],
        pan: String,
        gstin: String,
        ifsc: String,
        acno: String,
        packagingCharge: String,
        veg: String,
        // menuImg: [
        //     {
        //         data: Buffer,
        //         contentType: String
        //     },
        // ],
        menuImg: [String],
        payment: String,
        verified: String
    }, { timestamps: true });

restaurantSchema.pre("save", async function (next, error) {
    if (this.isModified("password")) {
        this.password = bcrypt.hashSync(this.password, 12);
    }
    next();
});

restaurantSchema.methods.generateAuthToken = async function () {
    try {
        return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 30
        })
    } catch (error) {
        console.log(error);
    }
}

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;