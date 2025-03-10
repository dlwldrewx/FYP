const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Get user's cart
router.get('/', authenticateUser, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price imageUrl');
        if (!cart) return res.json({ items: [], totalPrice: 0 });

        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// ✅ Add item to cart
router.post('/add', authenticateUser, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) cart = new Cart({ user: req.user.id, items: [] });

        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// ✅ Update item quantity
router.put('/update', authenticateUser, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (quantity < 1) return res.status(400).json({ error: "Quantity must be at least 1" });

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ error: "Item not in cart" });

        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// ✅ Remove item from cart
router.delete('/remove/:productId', authenticateUser, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// ✅ Clear entire cart
router.delete('/clear', authenticateUser, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.id });
        res.json({ message: "Cart cleared successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

module.exports = router;
