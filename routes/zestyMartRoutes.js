const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ZestyMart = require("../models/ZestyMart");
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
        cb(null, "MartItem" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/get-all-martItem", async (req, res) => {
    const mart = await ZestyMart.find();
    res.send(mart);
});

router.get("/get/:id", async (req, res) => {
    try {
        const martItemId = req.params.id;
        const martItem = await Menu.findById(martItemId);
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

router.post("/add-mart-item", upload.array("images", 5), async (req, res) => {
    const { name, category, description, price, weight } = req.body;
    try {
        const martItemExist = await ZestyMart.findOne({ name: name });
        if (martItemExist) {
            return res.status(401).json({ success: false, message: "Mart Item already exist." });
        }


        const mart = await ZestyMart({
            name,
            category,
            description,
            price,
            weight,
            images: req.files.map((file) => ({
                data: fs.readFileSync(file.path),
                contentType: file.contentType
            }))
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
})

module.exports = router;