const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ✅ Initialize cart in session
function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

// 🛒 ADD ITEM (AJAX)
router.post('/cart/add/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // ✅ Check stock availability
    if (product.stock <= 0) {
      return res.status(400).json({ error: 'Product is out of stock.' });
    }

    const cart = getCart(req);
    const existing = cart.find(item => item._id.toString() === product._id.toString());

    if (existing) {
      // ✅ Check if adding more would exceed stock
      if (existing.quantity >= product.stock) {
        return res.status(400).json({ error: `Only ${product.stock} items available in stock.` });
      }
      existing.quantity += 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        quantity: 1
      });
    }

    req.session.cart = cart;
    res.json({ success: true, count: cart.length });
  } catch (err) {
    console.error('❌ Error adding to cart:', err);
    res.status(500).json({ error: 'Error adding to cart' });
  }
});

// 🛍️ VIEW CART
router.get('/cart', (req, res) => {
  const cart = getCart(req);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = (subtotal + tax).toFixed(2);

  res.render('cart', {
    title: 'Your Cart',
    cart,
    subtotal: subtotal.toFixed(2),
    tax,
    total,
    cartCount: cart.length
  });
});

// 🧮 UPDATE QUANTITY (+/-)
router.post('/cart/update/:id', express.json(), async (req, res) => {
  try {
  const { id } = req.params;
  const { change } = req.body;
  const cart = getCart(req);

  const item = cart.find(p => p._id.toString() === id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // ✅ Check stock availability
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

    if (newQuantity > product.stock) {
      return res.status(400).json({ error: `Only ${product.stock} items available in stock.` });
    }

    item.quantity = newQuantity;
  req.session.cart = cart;
    res.json({ success: true, quantity: item.quantity });
  } catch (err) {
    console.error('❌ Error updating cart:', err);
    res.status(500).json({ error: 'Error updating cart' });
  }
});

// ❌ REMOVE ITEM
router.post('/cart/remove/:id', (req, res) => {
  let cart = getCart(req);
  cart = cart.filter(item => item._id.toString() !== req.params.id);
  req.session.cart = cart;
  res.redirect('/cart');
});

// 🔄 CART COUNT ENDPOINT
router.get('/cart-count', (req, res) => {
  const count = req.session.cart ? req.session.cart.length : 0;
  res.json({ count });
});

module.exports = router;