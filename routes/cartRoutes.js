const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart"); // Assuming you have a Cart model
const authMiddleware = require("../middleware/authMiddleware");

// 🛒 GET: Fetch User's Cart
router.get("/", authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
        if (!cart) return res.status(200).json({ items: [] });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error });
    }
});

// ➕ POST: Add Item to Cart
router.post("/add", authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error });
    }
});

// ❌ DELETE: Remove Item from Cart
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error removing item", error });
    }
});

// 🔄 PUT: Update Cart Item Quantity
router.put("/update", authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (item) {
            item.quantity = quantity;
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating cart", error });
    }
});

module.exports = router;
