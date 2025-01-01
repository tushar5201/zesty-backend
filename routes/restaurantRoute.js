const express = require("express");
const Restaurant = require("../models/Restaurant");
const fs = require('fs');
const multer = require("multer");

const router = express.Router();

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './images');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// })

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post("/signup", async (req, res) => {
    try {
        const { ownerFullName, restaurantName, email, password, workingDays, timings, phone, location, bankAc, totalEarnings } = req.body;

        // let menu = JSON.parse(req.body.menu);
        // const ParsedMenu = req.body.menu ? JSON.parse(req.body.menu) : [];
        // if (!req.files || req.files.length !== menu.length) {
        //     return res.status(400).json({ success: false, message: "Menu items and files do not match" });
        // }
        // const menu = ParsedMenu.map((item, index) => ({
        //     name: item.name,
        //     price: item.price,
        //     description: item.description,
        //     image: req.files[index] ? {
        //         data: req.files[index]?.buffer,
        //         contentType: req.files[index]?.mimetype
        //     } : null
        // }))
        // console.log(menu);
        
        const restroExist = await Restaurant.findOne({ restaurantName });

        if (restroExist) {
            return res.status(405).json({ success: false, message: "Restaurant name already exist." });
        }

        const restaurant = new Restaurant({ ownerFullName, restaurantName, email, password, workingDays, timings, phone, location, bankAc, totalEarnings });
        // if (req.file) {
        //     console.log("file");

        //     restaurant.menu[0].image.data = fs.readFileSync(req.file.path);
        //     restaurant.menu[0].image.contentType = req.file.type;
        // } else {
        //     console.log("no files");

        // }
        restaurant.save().then(() => {
            return res.status(201).json({ success: true, message: "Restaurant Registered", restaurant });
        });

    } catch (error) {
        console.log(error);
    }
});

module.exports = router;