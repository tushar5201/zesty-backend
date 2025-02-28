const express = require("express");
const Users = require("../models/Users");
const router = express.Router();

router.get("/get/:id", async (req, res) => {
    const user = await Users.findById(req.params.id);
    res.send(user);
})

router.post("/register", async (req, res) => {
    try {
        const { mobile, email, address, latitute, longitude } = req.body;
        const userExist = await Users.findOne({ mobile: mobile });
        if (userExist) {
            return res.status(405).json({ success: false, message: "User Exist" })
        }

        const user = new Users({ mobile, email, address, latitute, longitude });
        await user.save().then((user) => {
            return res.status(200).json({ success: true, user });
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;