const express = require("express");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const Users = require("../models/Users");
const { sendOrderToRestaurant, sendOrderToUser } = require("../socket");
const router = express.Router();

router.post("/add-order", async (req, res) => {
    try {
        const { restaurantId, restaurantName, userId, order, totalAmountUser, coupon, paymentMode } = req.body;
        const orders = new Order({ restaurantId, restaurantName, userId, order, totalAmountUser, coupon, paymentMode });
        await orders.save();
        await Restaurant.findByIdAndUpdate(restaurantId, { $push: { orders: orders._id } });
        await Users.findByIdAndUpdate(userId, { $push: { orders: orders._id } });

        sendOrderToRestaurant(restaurantId, orders);
        return res.status(200).json({ succss: true, orders });
    } catch (error) {
        console.log(error);
    }
});

router.get("/get-all-orders/:page", async (req, res) => {
    const { page } = req.params;
    let orders;
    if (page === 0) {
        orders = await Order.find();
    } else {
        orders = await Order.find()
            .limit(10)
            .skip(page * 10)
    }
    return res.send(orders);
})

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
        const pastOrder = await Order.find({ userId: userId });
        if (pastOrder.length > 0) {
            return res.status(200).json(pastOrder);
        } else {
            return res.status(404).json({ message: "No past orders" });
        }
    } catch (error) {
        console.log(error);
    }
});

router.get("/get-active-order-for-restaurant/:restaurantid", async (req, res) => {
    const restaurantId = req.params.restaurantid;
    try {
        const activeOrder = await Order.find({ restaurantId: restaurantId, orderStatus: { $in: ["Pending", "Active", "Prepared"] } });
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
        const pastOrder = await Order.find({ restaurantId: restaurantId });
        if (pastOrder.length > 0) {
            return res.status(200).json(pastOrder);
        } else {
            return res.status(404).json({ message: "No past orders" });
        }
    } catch (error) {

    }
});

router.post("/update-order-status", async (req, res) => {
    const { id, orderStatus, totalAmountRestaurant } = req.body;
    try {
        const order = await Order.findByIdAndUpdate(id, { orderStatus, totalAmountRestaurant });
        if (order) {
            const updatedOrder = await Order.findById(id);
            sendOrderToUser(order.userId, updatedOrder);
            return res.status(200).json({ success: true, message: "update success" });
        } else {
            return res.status(405).json({ success: false, message: "update failed" })
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;