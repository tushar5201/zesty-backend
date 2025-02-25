const express = require("express");
const Coupon = require("../models/Coupon");

const router = express.Router();

const multer = require('multer');

// Configure multer (no file storage needed for this case)
const upload = multer();


router.get("/get-all-coupons", async (req, res) => {
    const coupon = await Coupon.find();
    res.send(coupon);
});

router.get("/get/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Coupon.findById(id);
        return res.status(200).send(category);
    } catch (error) {
        console.log(error);
    }
})

router.post("/add-coupon", async (req, res) => {
    const { promoCode, description, discountPercentage, discountUpto, minAmtReq } = req.body;
    try {
        const promoCodeExist = await Coupon.findOne({ promoCode });
        if (promoCodeExist) {
            return res.status(401).json({ success: false, message: "Category already exist." });
        }

        const coupon = await Coupon({
            promoCode, description, discountPercentage, discountUpto, minAmtReq
        });

        await coupon.save().then(() => {
            return res.status(200).json({ success: true, message: "coupon saved." });
        }).catch((err) => {
            console.log(err);
            return res.status(405).json({ success: false, message: "coupon saving failed " + err });
        })
    } catch (error) {
        console.log(error);
    }
});

router.post("/update-coupon/:id", upload.none(), async (req, res) => {
    const id = req.params.id;
    let { minAmtReq, discountUpto, discountPercentage, description, promoCode } = req.body;

    try {
        const exist = await Coupon.findById(id);
        if (exist) {
            const updatedCoupon = {
                promoCode: promoCode || exist.promoCode,
                description: description || exist.description,
                discountPercentage: discountPercentage || exist.discountPercentage,
                discountUpto: discountUpto || exist.discountUpto,
                minAmtReq: minAmtReq || exist.minAmtReq
            };

            await Coupon.findByIdAndUpdate(id, updatedCoupon);
            return res.status(200).json({ success: true, message: "Coupon updated successfully" });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "not updated" });
    }
})

router.delete("/delete-coupon", async (req, res) => {
    try {
        const { id } = req.body;
        const del = await Coupon.findByIdAndDelete(id);
        if (del) {
            return res.status(200).send({
                success: true,
                message: 'coupon deleted successfully.'
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
            message: 'err in deleting coupon.',
            err
        })
    }
})

module.exports = router;