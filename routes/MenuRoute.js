const express = require("express");
const Menu = require("../models/Menu");
const multer = require("multer");
const fs = require('fs');
const path = require("path");

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage });

router.post("/add-item", upload.single("image"), async (req, res) => {
    try {
        const { name, price, description, category, restaurantId, foodType, packagingCharge, variant, addOnes } = req.body;
        const menuItem = new Menu({
            name,
            price,
            description,
            category,
            restaurantId,
            foodType,
            packagingCharge,
            variant,
            addOnes,
            image: {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype
            }
        });

        await menuItem.save().then(() => {
            return res.status(200).json({ success: true, message: "Menu Item saved." });
        }).catch((err) => {
            console.log(err);
            return res.status(405).json({ success: false, message: "Menu Item saving failed " + err });
        });
    } catch (error) {
        console.log(error);
    }
});

router.get("/get-details", async (req, res) => {
    try {
        const menus = await Menu.find().populate("restaurantId");
        return res.status(200).json({ success: true, menus });
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;