const express = require('express');
const Stripe = require('stripe');
const Order = require('../models/Order');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create a Stripe Checkout Session
router.post('/create-checkout-session', authenticateUser, async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId).populate('items.product');

        if (!order) return res.status(404).json({ error: "Order not found" });

        if (order.items.length === 0) {
            return res.status(400).json({ error: "No items in the order" });
        }

        const lineItems = order.items.map(item => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.product.name,
                },
                unit_amount: Math.round(item.product.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
            metadata: {
                orderId: order.id,
            },
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('Error creating checkout session:', err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// ✅ Handle Stripe Webhook (Payment Confirmation)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object;
                const orderId = session.metadata.orderId;

                await Order.findByIdAndUpdate(orderId, { status: "Paid" });
                console.log("✅ Payment successful for Order ID:", orderId);
                break;

            case "payment_intent.succeeded":
                console.log("✅ PaymentIntent succeeded:", event.data.object.id);
                break;

            case "payment_intent.payment_failed":
                console.error("❌ PaymentIntent failed:", event.data.object.id);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error("❌ Webhook Error:", err.message);
        res.status(400).json({ error: "Webhook handling error" });
    }
});

module.exports = router;
