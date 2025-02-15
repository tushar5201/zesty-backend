const express = require("express");
const Restaurant = require("../models/Restaurant");
const fs = require('fs');
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './images';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, "Restaurant" + Date.now() + path.extname(file.originalname));
    }
})

// const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/register", upload.fields([{ name: "logoImg", maxCount: 1 }, { name: "menuImg", maxCount: 5 }]), async (req, res) => {
    try {
        const { ownerName, restaurantName, pincode, shopNumber, floor, buildingName, selectedArea, city, state, email, mobile, workingDays, pan, gstin, ifsc, acno, packagingCharge, veg, payment, verified } = req.body;
        // const logoImg = `/images/${req.files["logoImg"][0].filename}`
        // const menuImg = req.files['menuImg'].map(file => `/images/${file.filename}`);
        // const restroExist = await Restaurant.findOne({ restaurantName });
        // if (restroExist) {
        //     return res.status(405).json({ success: false, message: "Restaurant name already exist." });
        // }
        const restaurant = new Restaurant({
            ownerName,
            restaurantName,
            pincode,
            shopNumber,
            floor,
            buildingName,
            selectedArea,
            city,
            state,
            email,
            mobile,
            workingDays,
            pan,
            gstin,
            ifsc,
            acno,
            packagingCharge,
            veg,
            payment,
            verified,
            logoImg: {
                // data: req.files.logoImg[0].buffer,
                data: fs.readFileSync(req.files.logoImg[0].path),
                contentType: req.files.logoImg[0].mimetype
            },
            menuImg: req.files.menuImg.map(file => ({
                data: fs.readFileSync(file.path),
                contentType: file.mimetype
            }))

        });

        // if (req.body.menuImg) {
        //     console.log(req.menuImg);

        // for (let i = 0; i < req.menuImg.length; i++) {
        //     console.log("pushed");
        //     restaurant.menuImg.push({
        //         data: fs.readFileSync(req.files[i].path),
        //         contentType: req.files[i].mimetype
        //     }); 
        // }
        // } else {
        //     console.log("no files");
        // }
        await restaurant.save().then(() => {
            return res.status(201).json({ success: true, message: "Restaurant Registered", restaurant });
        });

    } catch (error) {
        console.log(error);
    }
});



router.get("/get/:id", async (req, res) => {
    try {
        const restaurantId = req.params.id;
        // Fetch the first restaurant from the database (modify as needed)
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ message: "No restaurant found" });
        }

        res.status(200).json(restaurant);
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/get-all-restaurants", async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).send(restaurants);
    } catch (error) {

    }
});

router.get("/get-restaurant-logo/:id", async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).select("logoImg");

        if (restaurant.logoImg) {
            return res.status(200).json(restaurant.logoImg.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'err'
        })
    }
});

module.exports = router;