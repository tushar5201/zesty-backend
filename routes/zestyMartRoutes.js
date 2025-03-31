const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ZestyMart = require("../models/ZestyMart");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const { createClient } = require("redis");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './images';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, "MartItem" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const client = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});
client.on('error', err => console.log('Redis Client Error', err));
client.connect();
client.on('connect', () => console.log('Redis connecting...'));
client.on('ready', () => console.log('Redis connected and ready'));
client.on('end', () => console.log('Redis connection closed'));
client.on('error', (err) => console.error('Redis error:', err));

function generateKey(req) {
    const baseUrl = req.path.replace(/^\/+|\/+$/g, "").replace(/\//g, ":");
    const params = req.query;
    const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");
    return sortedParams ? `${baseUrl}:${sortedParams}` : baseUrl;
}

router.get("/test-redis", async (req, res) => {
    try {
        await client.set("testKey", "Redis Working!");
        const value = await client.get("testKey");
        res.json({ success: true, value });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/get-all-martItem", async (req, res) => {
    //redis key generation
    const key = generateKey(req);
    //redis checked for existing key / data
    const cachedMartItems = await client.get(key);
    if (cachedMartItems) {
        res.json(JSON.parse(cachedMartItems));
        return;
    }

    const mart = await ZestyMart.find();

    //set data to key
    await client.set(key, JSON.stringify(mart));
    // await client.expire(key, 30);
    res.json(mart);
});

router.get("/get/:id", async (req, res) => {
    try {

        //redis key generation
        const key = generateKey(req);
        //redis checked for existing key / data
        const cachedMartItems = await client.get(key);
        if (cachedMartItems) {
            res.json(JSON.parse(cachedMartItems));
            return;
        }

        const martItemId = req.params.id;
        const martItem = await ZestyMart.findById(martItemId);
        //set data to key
        await client.set(key, JSON.stringify(martItem));
        if (!martItem) {
            return res.status(404).json({ message: "No mart item found" });
        }

        return res.status(200).json(martItem);
    } catch (error) {
        console.error("Error fetching mart item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/get-martItem-images/:id", async (req, res) => {
    try {
        const mart = await ZestyMart.findById(req.params.id).select('images');
        const images = mart.images.map((img) => ({
            contentType: img.contentType,
            data: `data:${img.contentType};base64,${img.data.toString("base64")}`
        }));

        return res.status(200).send(images);
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            message: 'err'
        })
    }
});

// router.post("/add-mart-item", upload.array("images", 5), async (req, res) => {
//     const { name, category, description, price, weight } = req.body;
//     try {
//         const martItemExist = await ZestyMart.findOne({ name: name });
//         if (martItemExist) {
//             return res.status(401).json({ success: false, message: "Mart Item already exist." });
//         }


//         const mart = await ZestyMart({
//             name,
//             category,
//             description,
//             price,
//             weight,
//             images: req.files.map((file) => ({
//                 data: fs.readFileSync(file.path),
//                 contentType: file.mimetype
//             }))
//         });

//         await mart.save().then(() => {
//             return res.status(200).json({ success: true, message: "Mart item saved." });
//         }).catch((err) => {
//             console.log(err);
//             return res.status(405).json({ success: false, message: "mart item saving failed " + err });
//         })
//     } catch (error) {
//         console.log(error);
//     }
// });

router.post("/add-mart-item", upload.array("images", 5), async (req, res) => {
    const { name, category, description, price, weight, pack } = req.body;
    const files = req.files; // Array of uploaded files
    try {
        const martItemExist = await ZestyMart.findOne({ name: name });
        if (martItemExist) {
            return res.status(401).json({ success: false, message: "Mart Item already exist." });
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        //upload to cloudinary

        const imgUrls = [];
        for (const file of files) {
            const cloudinaryUploadResponse = await cloudinary.uploader.upload(file.path);
            imgUrls.push(cloudinaryUploadResponse.secure_url);
        }

        const mart = await ZestyMart({
            name,
            category,
            description,
            price,
            weight,
            pack,
            images: imgUrls
        });

        await mart.save().then(() => {
            return res.status(200).json({ success: true, message: "Mart item saved." });
        }).catch((err) => {
            console.log(err);
            return res.status(405).json({ success: false, message: "mart item saving failed " + err });
        })
    } catch (error) {
        console.log(error);
    }
});

router.post("/update-mart-item", upload.array("images", 5), async (req, res) => {
    const { id, name, category, price, description, weight, existingImages } = req.body;
    const newImages = req.files; // Newly uploaded images

    try {
        const exist = await ZestyMart.findById(id);
        if (!exist) {
            return res.status(404).json({ success: false, message: "Mart item not found" });
        }

        let updatedImages = [];
        if (existingImages) {
            updatedImages = JSON.parse(existingImages); // Parse existing images
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        if (newImages && newImages.length > 0) {
            for (const file of newImages) {
                const cloudinaryUploadResponse = await cloudinary.uploader.upload(file.path);
                updatedImages.push(cloudinaryUploadResponse.secure_url);
            }
            // newImages.forEach((file) => {
            //     updatedImages.push({
            //         data: fs.readFileSync(file.path), // Save the file path
            //         contentType: file.mimetype,
            //     });
            // });
        }

        // Update the mart item
        const updatedItem = {
            name: name || exist.name,
            category: category || exist.category,
            price: price || exist.price,
            description: description || exist.description,
            weight: weight || exist.weight,
            images: updatedImages, // Update images array
        };

        await ZestyMart.findByIdAndUpdate(id, updatedItem);

        return res.status(200).json({ success: true, message: "Mart item updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});


router.delete("/delete-mart-item", async (req, res) => {
    try {
        const { id } = req.body;
        const del = await ZestyMart.findByIdAndDelete(id);
        if (del) {
            return res.status(200).send({
                success: true,
                message: 'mart item deleted successfully.'
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
            message: 'err in deleting mart item.',
            err
        })
    }
});

router.get("/get-category-wise/:category", async (req, res) => {
    try {
        const category = req.params.category;
        const data = await ZestyMart.find({ category });
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;