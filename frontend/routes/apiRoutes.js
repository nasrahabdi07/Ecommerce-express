// /routes/apiRoutes.js
const express = require('express');
const router = express.Router();

// ✅ Return current cart session as JSON
router.get('/api/cart', (req, res) => {
  const cart = req.session.cart || [];

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({
    cart,
    subtotal,
    itemCount: cart.length,
  });
});

module.exports = router;