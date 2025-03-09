// routes/recommendationRoutes.js
const express = require('express');
const { recommendProducts } = require('../services/recommendationService');

const router = express.Router();

// ✅ Get product recommendations based on a given product ID
router.get('/:productId/recommendations', async (req, res) => {
    try {
        const recommendations = await recommendProducts(req.params.productId);
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching recommendations' });
    }
});

module.exports = router;
