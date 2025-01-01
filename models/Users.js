const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    mobile: String,
    isAdmin: { type: Boolean, default: false },
}, {timestamps: true});

userSchema.plugin(passportLocalMongoose);
const Users = mongoose.model("Users", userSchema);
module.exports = Users;