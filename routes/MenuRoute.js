const express = require("express");
const Menu = require("../models/Menu");
const multer = require("multer");
const fs = require('fs');
const path = require("path");
const Restaurant = require("../models/Restaurant");
const cloudinary = require("cloudinary").v2;

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

// router.post("/add-item", upload.single("image"), async (req, res) => {
//     try {
//         let { name, price, description, category, restaurantId, foodType, packagingCharge, variant, addOnes } = req.body;
//         if (typeof addOnes === "string") {
//             addOnes = JSON.parse(addOnes); // Parse if it's a string
//         }
//         if (typeof variant === "string") {
//             variant = JSON.parse(variant); // Parse if it's a string
//         }
//         const menuItem = new Menu({
//             name,
//             price,
//             description,
//             category,
//             restaurantId,
//             foodType,
//             packagingCharge,
//             variant,
//             addOnes,
//             image: {
//                 data: fs.readFileSync(req.file.path),
//                 contentType: req.file.mimetype
//             }
//         });

//         await menuItem.save();
//         await Restaurant.findByIdAndUpdate(restaurantId, { $push: { menu: menuItem._id } });
//         return res.status(200).json({ success: true, message: "Menu Item saved." });
//     } catch (error) {
//         console.log(error);
//     }
// });

router.get("/get-all-menu-items", async (req, res) => {
    const menuItem = await Menu.find();
    res.send(menuItem);
})

router.post("/add-item", upload.single("image"), async (req, res) => {
    try {
        let { name, price, description, category, restaurantId, foodType, packagingCharge, variant, addOnes } = req.body;
        if (typeof addOnes === "string") {
            addOnes = JSON.parse(addOnes); // Parse if it's a string
        }
        if (typeof variant === "string") {
            variant = JSON.parse(variant); // Parse if it's a string
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        //upload to cloudinary
        const cloudinaryUploadResponse = await cloudinary.uploader.upload(req.file.path);
        const imageUrl = cloudinaryUploadResponse.secure_url; // Public URL of the uploaded image

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
            image: imageUrl
        });

        await menuItem.save();
        await Restaurant.findByIdAndUpdate(restaurantId, { $push: { menu: menuItem._id } });
        return res.status(200).json({ success: true, message: "Menu Item saved." });
    } catch (error) {
        console.log(error);
    }
});

router.get("/get/:id", async (req, res) => {
    try {
        const menuId = req.params.id;
        const menu = await Menu.findById(menuId);
        if (!menu) {
            return res.status(404).json({ message: "No menu item found" });
        }

        return res.status(200).json(menu);
    } catch (error) {
        console.error("Error fetching menu item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/delete-menu-item", async (req, res) => {
    try {
        const { id } = req.body;
        const menuItem = await Menu.findById(id);
        const restaurantId = menuItem.restaurantId;

        await Menu.findByIdAndDelete(id);
        await Restaurant.findByIdAndUpdate(
            restaurantId,
            { $pull: { menu: id } },
            { new: true }
        )

        return res.status(200).send({
            success: true,
            message: 'menu deleted successfully.'
        })
    } catch (error) {
        console.log(error);
        return res.status(401).send({
            success: true,
            message: 'err in deleting menu.',
            err
        })
    }
});

// router.get("/get-category-wise-restaurants/:category", async (req, res) => {
//     try {
//         const { category } = req.params;
//         const menuItems = await Menu.find({ category }).select("restaurantId").distinct('_id');

//         // Fetch restaurant details for each menu item
//         const resList = await Promise.all(
//             menuItems.map(async (item) => {
//                 const restaurant = await Restaurant.findById(item.restaurantId);
//                 return restaurant; // Return the restaurant details
//             })
//         );

//         // Filter out null values (if any restaurant is not found)
//         const filteredResList = resList.filter((res) => res !== null);

//         return res.status(200).send(filteredResList);
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send("Internal Server Error");
//     }
// });

router.get("/get-category-wise-restaurants/:category", async (req, res) => {
    try {
        const { category } = req.params;

        // Get distinct restaurant IDs from the Menu collection based on category
        const restaurantIds = await Menu.find({ category })
            .distinct("restaurantId"); // Correct field for distinct restaurant IDs

        // Fetch restaurant details for each distinct restaurant ID
        const resList = await Restaurant.find({ _id: { $in: restaurantIds } });

        return res.status(200).json(resList);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});


router.post("/update-item", upload.single("image"), async (req, res) => {
    try {
        let { id, name, description, foodType, category, price, packagingCharge } = req.body;
        const exist = await Menu.findById(id);
        let imageUrl;
        if (req.file) {
            // Configure Cloudinary
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
            //upload to cloudinary
            const cloudinaryUploadResponse = await cloudinary.uploader.upload(req.file.path);
            imageUrl = cloudinaryUploadResponse.secure_url; // Public URL of the uploaded image
        }

        if (exist) {
            const updatedItem = {
                name: name || exist.name,
                description: description || exist.description,
                foodType: foodType || exist.foodType,
                category: category || exist.category,
                price: price || exist.price,
                packagingCharge: packagingCharge || exist.packagingCharge,
                image: imageUrl ||exist.image
            }

            await Menu.findByIdAndUpdate(id, updatedItem);
            return res.status(200).json({ success: true, message: "updated" });
        } else {
            return res.status(405).json({success: false, message: "Menu Item not Found"})
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "not updated" });
    }
})

module.exports = router;