// services/recommendationService.js
const Product = require('../models/Product');

const recommendProducts = async (productId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        // Simple example: Recommend products in the same category
        const recommendations = await Product.find({
            category: product.category,
            _id: { $ne: productId },  // Exclude the current product
        }).limit(5);  // Limit to 5 recommended products

        return recommendations;
    } catch (error) {
        console.error("Error getting recommendations:", error);
        return [];
    }
};

module.exports = { recommendProducts };
