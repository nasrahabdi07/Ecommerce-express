const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // adjust path if needed

// 🛍️ Checkout Page
router.get('/checkout', (req, res) => {
  const cart = req.session.cart || [];

  // ✅ Validate cart is not empty
  if (!cart || cart.length === 0) {
    return res.redirect('/cart');
  }

  // ✅ Ensure price & quantity are numbers
  const subtotal = cart.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);

  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  res.render('checkout', {
    title: 'Checkout',
    cart,
    subtotal, // ✅ Pass as number
    tax,
    total,
  });
});


module.exports = router;