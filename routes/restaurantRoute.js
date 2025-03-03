const express = require("express");
const Restaurant = require("../models/Restaurant");
const fs = require('fs');
const multer = require("multer");
const path = require("path");
const { sendToAdmin } = require("../socket");
const cloudinary = require("cloudinary").v2;

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

const upload = multer({ storage: storage });

// router.post("/register", upload.fields([{ name: "logoImg", maxCount: 1 }, { name: "menuImg", maxCount: 5 }]), async (req, res) => {
//     try {
//         const { ownerName, restaurantName, pincode, shopNumber, floor, buildingName, selectedArea, city, state, latitude, longitude, email, mobile, workingDays, pan, gstin, ifsc, acno, packagingCharge, veg, payment, verified } = req.body;
//         const restaurant = new Restaurant({
//             ownerName,
//             restaurantName,
//             pincode,
//             shopNumber,
//             floor,
//             buildingName,
//             selectedArea,
//             city,
//             state,
//             latitude,
//             longitude,
//             email,
//             mobile,
//             workingDays,
//             pan,
//             gstin,
//             ifsc,
//             acno,
//             packagingCharge,
//             veg,
//             payment,
//             verified,
//             logoImg: {
//                 data: fs.readFileSync(req.files.logoImg[0].path),
//                 contentType: req.files.logoImg[0].mimetype
//             },
//             menuImg: req.files.menuImg.map(file => ({
//                 data: fs.readFileSync(file.path),
//                 contentType: file.mimetype
//             }))
//         });

//         await restaurant.save().then(() => {
//             return res.status(201).json({ success: true, message: "Restaurant Registered", restaurant });
//         });

//     } catch (error) {
//         console.log(error);
//     }
// });

router.post("/register", upload.fields([{ name: "logoImg", maxCount: 1 }, { name: "menuImg", maxCount: 5 }]), async (req, res) => {
    try {
        const { ownerName, restaurantName, cuisines, pincode, shopNumber, floor, buildingName, selectedArea, city, state, latitude, longitude, email, mobile, workingDays, pan, gstin, ifsc, acno, packagingCharge, veg, payment, verified } = req.body;
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        //upload to cloudinary
        const cloudinaryUploadResponse = await cloudinary.uploader.upload(req.files.logoImg[0].path);
        const logoUrl = cloudinaryUploadResponse.secure_url; // Public URL of the uploaded image
        const restaurant = new Restaurant({
            ownerName,
            restaurantName,
            cuisines,
            pincode,
            shopNumber,
            floor,
            buildingName,
            selectedArea,
            city,
            state,
            latitude,
            longitude,
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
            logoImg: logoUrl,
            menuImg: req.files.menuImg.map(file => ({
                data: fs.readFileSync(file.path),
                contentType: file.mimetype
            }))
        });

        await restaurant.save().then(() => {
            return res.status(201).json({ success: true, message: "Restaurant Registered", restaurant });
        });

    } catch (error) {
        console.log(error);
    }
});

router.put("/update-verification/:id", async (req, res) => {
    try {
        const updateRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, { verified: req.body.verified }, { new: true });
        return res.status(200).json({ success: true, data: updateRestaurant });
    } catch (err) {
        return res.status(405).json({ success: false, message: "Error updating restaurant." });
    }
})

router.get("/get/:id", async (req, res) => {
    try {
        const restaurantId = req.params.id;
        // Fetch the first restaurant from the database (modify as needed)
        const restaurant = await Restaurant.findById(restaurantId).populate("menu").populate("ad");
        if (!restaurant) {
            return res.status(404).json({ message: "No restaurant found" });
        }

        return res.status(200).json(restaurant);
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

router.get("/get-order-size-wise", async (req, res) => {
    const restaurants = await Restaurant.aggregate([
        {
            $lookup: {
                from: "orders", // Match with Order collection
                localField: "_id",
                foreignField: "restaurantId",
                as: "orderDetails"
            }
        },
        {
            $addFields: { totalOrders: { $size: "$orderDetails" } }
        },
        {
            $sort: { totalOrders: -1 } // Sort in descending order
        }
    ]);
    res.send(restaurants);
});

router.get("/get-restaurant-logo/:id", async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).select("logoImg");
        // console.log(restaurant);

        if (restaurant.logoImg) {
            res.set('content-type', restaurant.logoImg.contentType)
            return res.status(200).send(restaurant.logoImg.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'err'
        })
    }
});

router.get("/get-menu-images/:id", async (req, res) => {
    try {
        const menuItem = await Restaurant.findById(req.params.id).select("menuImg");
        const images = menuItem.menuImg.map((img) => ({
            contentType: img.contentType,
            data: `data:${img.contentType};base64,${img.data.toString("base64")}`
        }));
        res.status(200).json({ success: true, images });
    } catch (error) {
        console.error(error);
        res.status(405).json({ success: false, message: "Internal Server Error" });
    }
});

router.put("/update-payment-status/:id", async (req, res) => {
    try {
        const paymentStatus = await Restaurant.findByIdAndUpdate(req.params.id, { $set: { payment: "Success" } });
        if (!paymentStatus) {
            return res.status(401).json({ success: false, message: "err in updating" });
        }
        const restaurant = await Restaurant.findById(req.params.id);
        sendToAdmin(restaurant);
        return res.status(200).json({ success: true, message: "Payment status updated" });

    } catch (error) {
        console.log(error);
        return res.status(405).json({ success: false, message: "Internal server error" });
    }
});

router.get("/check-exist/:mobile", async (req, res) => {
    try {
        const mobile = req.params.mobile;
        const exist = await Restaurant.findOne({ mobile });
        if (exist) {
            return res.status(200).json({ success: true, restaurantData: exist })
        }
    } catch (error) {
        console.log(error);
    }
});

router.delete("/delete-restaurant", async (req, res) => {
    try {
        const { id } = req.body;
        const del = await Restaurant.findByIdAndDelete(id);
        if (del) {
            return res.status(200).send({
                success: true,
                message: 'restaurant deleted successfully.'
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
            message: 'err in deleting restaurant.',
            err
        })
    }
});

module.exports = router;