const express = require("express");
const Users = require("../models/Users");
const router = express.Router();

router.get("/get-all-users", async (req, res) => {
    const users = await Users.find();
    res.send(users);
})

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

router.post("/check-exist", async (req, res) => {
    try {
        const { mobile } = req.body;
        const userExist = await Users.findOne({ mobile: mobile });
        if (userExist) {
            return res.status(200).json({ success: true, userExist });
        } else {
            return res.status(405).json({ success: false, message: "User not exist" })
        }
    } catch (error) {
        console.log(error);
    }
});

router.post("/update-zesty-money", async (req, res) => {
    try {
        const { userId, zestyMoney } = req.body;
        const update = await Users.findByIdAndUpdate(userId, { zestyMoney });
        if (update) {
            return res.status(200).json({ message: "updated" });
        } else {
            return res.status(405).json({ message: "update failed" });
        }
    } catch (error) {
        console.log(error);
    }
});

router.delete("/delete-user", async (req, res) => {
    try {
        const { id } = req.body;
        const del = await Users.findByIdAndDelete(id);
        if (del) {
            return res.status(200).send({
                success: true,
                message: 'user deleted successfully.'
            })
        }
        return res.status(405).json({
            success: false,
            message: "err in deleting"
        })
    } catch (error) {
        console.log(error);
        return res.status(401).send({
            success: true,
            message: 'err in deleting user.',
            err
        })
    }
});

router.post("/update-user", async (req, res) => {
    try {
        let { name, email, address, mobile, zestyLite, id } = req.body;
        const userExist = await Users.findById(id);

        if (!userExist) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let updateQuery = {
            name: name || userExist.name,
            email: email || userExist.email,
            mobile: mobile || userExist.mobile,
            zestyLite: zestyLite || userExist.zestyLite
        };

        // If an address is provided, push it into the address array
        if (address) {
            await Users.findByIdAndUpdate(id, { $push: { address } }, { new: true });
        }

        const user = await Users.findByIdAndUpdate(id, updateQuery, { new: true });

        return res.status(200).json({ success: true, message: "User updated successfully", user });

    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, message: "Update failed", error: error.message });
    }
});

router.post("/delete-address", async (req, res) => {
    try {
        const { id, address } = req.body;
        if (!id || !address) {
            return res.status(400).json({ success: false, message: "User ID and address are required" });
        }

        const user = await Users.findByIdAndUpdate(
            id,
            { $pull: { address: address } },  // Removes the specific address
            { new: true }
        );

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, message: "Address removed successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(405).json({ success: false, message: "err" });
    }
})

module.exports = router;