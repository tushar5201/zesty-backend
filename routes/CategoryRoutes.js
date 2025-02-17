const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");

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
        cb(null, "Category" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/add-category", (req, res) => {
    return res.json("hello")
})

router.post("/add-category", upload.single("image"), async (req, res) => {
    const { name } = req.body;
    try {
        const categoryExist = await Category.findOne({ name: name });
        if (categoryExist) {
            return res.status(401).json({ success: false, message: "Category already exist." });
        }

        const category = await Category({
            name,
            image: {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype
            }
        });

        await category.save().then(() => {
            return res.status(200).json({ success: true, message: "Category saved." });
        }).catch((err) => {
            console.log(err);
            return res.status(405).json({ success: false, message: "category saving failed " + err });
        })
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;