const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function ensureAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.redirect('/admin/login');
}

router.get('/admin/login', (req, res) => {
  res.render('admin-login', { error: null });
});

router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.render('admin-login', { error: 'Invalid admin password' });
});

router.get('/admin/logout', ensureAdmin, (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

router.get('/admin', ensureAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const totalOrders = orders.length;
    const totalRevenueUSD = orders.reduce((sum, order) => sum + (order.totalAmountUSD || 0), 0);
    const currencyTotals = orders.reduce((acc, order) => {
      const currency = (order.currency || 'usd').toLowerCase();
      acc[currency] = (acc[currency] || 0) + (order.total || 0);
      return acc;
    }, {});

    res.render('admin-dashboard', {
      orders,
      totalOrders,
      totalRevenueUSD,
      currencyTotals,
    });
  } catch (err) {
    console.error('❌ Admin dashboard error:', err);
    res.status(500).send('Error loading admin dashboard');
  }
});

module.exports = router;

