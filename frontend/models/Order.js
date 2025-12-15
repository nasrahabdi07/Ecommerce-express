const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // Stripe session ID
  customerEmail: String,
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  shipping: {
    country: String,
    address: String,
    currency: String,
    paymentStatus: String,
  },
  currency: String,
  subtotal: Number,
  shippingFee: Number,
  tax: Number,
  total: Number,
  totalAmount: Number,
  totalAmountUSD: Number,
  totalAmountDisplay: Number,
  paymentStatus: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);