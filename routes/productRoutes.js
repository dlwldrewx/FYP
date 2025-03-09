const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

// ✅ Get all products (Public)
router.get('/', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// ✅ Get a single product (Public)
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
});

// 🔒 Create a product (Admin only)
router.post('/', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const { name, description, price, category, imageUrl, stock } = req.body;
        const newProduct = new Product({ name, description, price, category, imageUrl, stock });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// 🔒 Update a product (Admin only)
router.put('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// 🔒 Delete a product (Admin only)
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});


module.exports = router;
