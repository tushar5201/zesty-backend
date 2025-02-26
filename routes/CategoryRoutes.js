const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './images/category';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, "Category"+ Date.now() + path.extname(file.originalname));
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
            res.set('content-type', category.image.contentType)
            return res.status(200).send(category.image.data)
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            message: 'err'
        })
    }
});

// router.post("/add-category", upload.single("image"), async (req, res) => {
//     const { name } = req.body;
//     try {
//         const categoryExist = await Category.findOne({ name: name });
//         if (categoryExist) {
//             return res.status(401).json({ success: false, message: "Category already exist." });
//         }

//         const category = await Category({
//             name,
//             image: {
//                 data: fs.readFileSync(req.file.path),
//                 contentType: req.file.mimetype
//             }
//         });

//         await category.save().then(() => {
//             return res.status(200).json({ success: true, message: "Category saved." });
//         }).catch((err) => {
//             console.log(err);
//             return res.status(405).json({ success: false, message: "category saving failed " + err });
//         })
//     } catch (error) {
//         console.log(error);
//     }
// });

router.post("/add-category", upload.single("image"), async (req, res) => {
    const { name } = req.body;
    const img = req.file;
    try {
        const categoryExist = await Category.findOne({ name: name });
        if (categoryExist) {
            return res.status(401).json({ success: false, message: "Category already exist." });
        }

        const category = await Category({
            name,
            image: `https://zesty-backend.onrender.com/uploads/${img.filename}`
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
})

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
});

router.get("/get/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        return res.status(200).send(category);
    } catch (error) {
        console.log(error);
    }
})

router.post("/update-category", upload.single("image"), async (req, res) => {
    try {
        let { id, name } = req.body;
        const image = req.file;
        const exist = await Category.findById(id);
        if (exist) {
            if (name === "") {
                name = exist.name;
            }

            const category = await Category.findByIdAndUpdate(id, { name });
            if (image) {
                category.image.data = fs.readFileSync(image.path);
                category.image.contentType = image.mimetype;
            } else {
                category.image.data = exist.image.data;
                category.image.contentType = exist.image.contentType;
            }

            await category.save();
            return res.status(200).json({ success: true, message: "updated" });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "not updated" });
    }
});

module.exports = router;