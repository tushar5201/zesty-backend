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

router.post("/addItems", upload.single("image"), async (req, res) => {
    try {
        const { name, price, description, category, restaurantId } = req.body;
        const menuItem = new Menu({ name, price, description, category, restaurantId });

        if (req.file) {
            console.log("file");
            menuItem.image.data = fs.readFileSync(req.file.path);
            menuItem.image.contentType = req.file.type;
        } else {
            console.log("no files");
        }
        menuItem.save().then(() => {
            return res.status(201).json({
                success: true,
                menuItem
            })
        });
    } catch (error) {
        console.log(error);
    }
});

router.get("/get-image", async (req, res) => {
    try {
        const image = await Menu.findById("6773dd2d247878a94755edc7").select("image");
        if(image.image) {
            res.set('content-type', image.image.name);
            return res.status(200).send(image.image.data);
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;