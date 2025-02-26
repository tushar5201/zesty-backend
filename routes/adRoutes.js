const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Ad = require("../models/Ad");
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
        cb(null, "Ad" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/get-all-ads", async (req, res) => {
    const ad = await Ad.find();
    res.send(ad);
});

router.get("/get-ad/:id", async (req, res) => {
    try {
        const ad = await Ad.findOne({ restaurantId: req.params.id });
        return res.status(200).send(ad)
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            message: 'err'
        })
    }
});

// router.post("/create-ad", upload.single("image"), async (req, res) => {
//     const { restaurantId } = req.body;
//     try {
//         const ad = await Ad({
//             restaurantId,
//             image: {
//                 data: fs.readFileSync(req.file.path),
//                 contentType: req.file.mimetype
//             }
//         });

//         await ad.save().then(() => {
//             return res.status(200).json({ success: true, message: "ad saved." });
//         }).catch((err) => {
//             console.log(err);
//             return res.status(405).json({ success: false, message: "ad saving failed " + err });
//         })
//     } catch (error) {
//         console.log(error);
//     }
// });

router.post("/create-ad", upload.single("image"), async (req, res) => {
    const { restaurantId } = req.body;
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        //upload to cloudinary
        const cloudinaryUploadResponse = await cloudinary.uploader.upload(req.file.path);
        const imageUrl = cloudinaryUploadResponse.secure_url; // Public URL of the uploaded image
        const ad = await Ad({
            restaurantId,
            image: imageUrl
        });

        await ad.save().then(() => {
            return res.status(200).json({ success: true, message: "ad saved." });
        }).catch((err) => {
            console.log(err);
            return res.status(405).json({ success: false, message: "ad saving failed " + err });
        })
    } catch (error) {
        console.log(error);
    }
});
module.exports = router;
