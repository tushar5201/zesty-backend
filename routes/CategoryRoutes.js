const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");
const sharp = require("sharp");

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
});

router.get("/get-all-category", async (req, res) => {
    const category = await Category.find();
    res.send(category);
});

router.get("/get-category-image/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).select('image');
        if (category.image) {
            const optimizedImage = await sharp(category.image.data)
            .resize(200)
            .jpeg({quality: 70})
            .toBuffer();
            res.set('content-type', 'image/jpeg')
            return res.status(200).send(optimizedImage)
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            message: 'err'
        })
    }
});

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

router.delete("/delete-category", async (req, res) => {
    try {
        const { id } = req.body;
        const del = await Category.findByIdAndDelete(id);
        if (del) {
            return res.status(200).send({
                success: true,
                message: 'category deleted successfully.'
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
            message: 'err in deleting category.',
            err
        })
    }
})

module.exports = router;