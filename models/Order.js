const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalPrice: { type: Number, required: true },
    shippingInfo: {
      name: String,
      email: String,
      address: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentIntentId: String, // Used for Stripe payments
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
