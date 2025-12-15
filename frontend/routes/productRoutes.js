const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 🏠 HOMEPAGE
router.get('/', async (req, res) => {
  try {
    const category = decodeURIComponent(req.query.category || 'All');
    const filter = category !== 'All' ? { category } : {};

    // ✅ Fetch up to 5 latest products
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('✅ Loaded products for homepage:', products.length);

    // ✅ Ensure cartCount is always defined
    const cartCount = req.session.cart ? req.session.cart.length : 0;

    res.render('index', {
      title: 'ShopEase',
      products,
      selectedCategory: category,
      cartCount
    });
  } catch (err) {
    console.error('❌ Error loading homepage:', err);
    res.status(500).send('Error loading homepage');
  }
});
// 🛍️ PRODUCTS PAGE (Pagination + Sorting + Category)
router.get('/products', async (req, res) => {
  const perPage = 8;
  const page = parseInt(req.query.page) || 1;
  const sortBy = req.query.sort || 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;
  const category = decodeURIComponent(req.query.category || 'All').trim();

  try {
    const filter = category !== 'All' ? { category } : {};

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage) || 1;

    // 🧠 Never let page go out of range
    const safePage = Math.max(1, Math.min(page, totalPages));

    const products = await Product.find(filter)
      .sort({ [sortBy]: order, _id: 1 })
      .skip((safePage - 1) * perPage)
      .limit(perPage);

    // 🪄 Debug log (optional - helps confirm count)
    console.log({
      category,
      totalProducts,
      totalPages,
      safePage,
      productsShown: products.length
    });

    res.render('products', {
      title: 'Our Products',
      products,
      currentPage: safePage,
      totalPages,
      selectedCategory: category,
      sortBy,
      order
    });
  } catch (err) {
    console.error('❌ Error loading products:', err);
    res.status(500).send('Error loading product list');
  }
});

module.exports = router;