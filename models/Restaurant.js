const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const restaurantSchema = new mongoose.Schema(
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
        latitude: Number,
        longitude: Number,
        email: String,
        mobile: String,
        workingDays: [
            String
        ],
        pan: String,
        gstin: String,
        ifsc: String,
        acno: String,
        veg: String,
        menuImg: [
            {
                data: Buffer,
                contentType: String
            },
        ],
        payment: String,
        verified: String,
        logoImg: String,
        menu: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Menus"
            }
        ],
        ad: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ads"
            }
        ]
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