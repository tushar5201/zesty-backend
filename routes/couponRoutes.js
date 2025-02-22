const express = require("express");
const Coupon = require("../models/Coupon");

const router = express.Router();

router.get("/get-all-coupons", async (req, res) => {
    const coupon = await Coupon.find();
    res.send(coupon);
});

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