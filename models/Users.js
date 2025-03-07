const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: String,
    mobile: String,
    zestyLite: {
        type: String,
        default: "false"
    },
    zestyMoney: {
        type: String,
        default: "0"
    },
    address: [String],
    latitute: String,
    longitude: String,
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders"
    }]
}, { timestamps: true });

const Users = mongoose.model("Users", userSchema);
module.exports = Users;