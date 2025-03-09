const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Place an order
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { userInfo, cart, total } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const newOrder = new Order({
            user: req.user.id,  // Ensure the user is authenticated
            items: cart.map(item => ({
                product: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: total,
            shippingAddress: userInfo.address,
            status: "Pending"
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Get user's orders
router.get('/', authenticateUser, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// ✅ Admin: Get all orders
router.get('/all', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// ✅ Admin: Update order status
router.put('/update/:orderId', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findById(req.params.orderId);

        if (!updatedOrder) return res.status(404).json({ error: "Order not found" });

        updatedOrder.status = status;
        await updatedOrder.save();

        res.json({ success: true, message: "Order status updated successfully", order: updatedOrder });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

module.exports = router;
