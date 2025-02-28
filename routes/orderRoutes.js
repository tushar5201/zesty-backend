const express = require("express");
const Order = require("../models/Order");
const router = express.Router();

router.post("/add-order", async (req, res) => {
    try {
        const { restaurantId, restaurantName, userId, order, totalAmount, coupon, paymentMode, orderStatus } = req.body;
        const orders = new Order({ restaurantId, restaurantName, userId, order, totalAmount, coupon, paymentMode, orderStatus });
        await orders.save().then(() => {
            return res.status(200).json({ succss: true, orders });
        })
    } catch (error) {
        console.log(error);
    }
});

router.get("/get-active-order-for-user/:userid", async (req, res) => {
    const userId = req.params.userid;
    try {
        const activeOrder = await Order.find({ userId: userId, orderStatus: { $in: ["Active", "Preparing", "Pickedup"] } });
        if (activeOrder) {
            return res.status(200).json(activeOrder);
        } else {
            return res.status(404).json({ message: "No active order found for the user" });
        }
    } catch (error) {
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

router.get("/get-all-orders-for-user/:userid", async (req, res) => {
    const userId = req.params.userid;
    try {
        const pastOrder = await Order.find({ userId: userId, orderStatus: "Delivered" });
        if (pastOrder.length > 0) {
            return res.status(200).json(pastOrder);
        } else {
            return res.status(404).json({ message: "No past orders" });
        }
    } catch (error) {

    }
});

router.get("/get-active-order-for-restaurant/:restaurantid", async (req, res) => {
    const restaurantId = req.params.restaurantid;
    try {
        const activeOrder = await Order.find({ restaurantId: restaurantId, orderStatus: { $in: ["Active", "Preparing", "Pickedup"] } });
        if (activeOrder) {
            return res.status(200).json(activeOrder);
        } else {
            return res.status(404).json({ message: "No active order found for the user" });
        }
    } catch (error) {
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

router.get("/get-all-orders-for-restaurant/:restaurantid", async (req, res) => {
    const restaurantId = req.params.restaurantid;
    try {
        const pastOrder = await Order.find({ restaurantId: restaurantId, orderStatus: "Delivered" });
        if (pastOrder.length > 0) {
            return res.status(200).json(pastOrder);
        } else {
            return res.status(404).json({ message: "No past orders" });
        }
    } catch (error) {

    }
});

module.exports = router;