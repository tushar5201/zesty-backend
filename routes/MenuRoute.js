const express = require("express");
const Menu = require("../models/Menu");
const multer = require("multer");
const fs = require('fs');
const path = require("path");
const Restaurant = require("../models/Restaurant");

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
        let { name, price, description, category, restaurantId, foodType, packagingCharge, variant, addOnes } = req.body;
        if (typeof addOnes === "string") {
            addOnes = JSON.parse(addOnes); // Parse if it's a string
        }
        if (typeof variant === "string") {
            variant = JSON.parse(variant); // Parse if it's a string
        }
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

        await menuItem.save();
        await Restaurant.findByIdAndUpdate(restaurantId, { $push: { menu: menuItem._id } });
        return res.status(200).json({ success: true, message: "Menu Item saved." });
    } catch (error) {
        console.log(error);
    }
});

router.get("/get-menu-image/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const menus = await Menu.findById(id).select("image");
        if (menus.image) {
            res.set("content-type", menus.imagecontentType);
            return res.status(200).send(menus.image.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'err'
        });
    }
})

module.exports = router;