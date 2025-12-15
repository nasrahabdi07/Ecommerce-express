// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const Stripe = require('stripe');
const Order = require('./models/Order');

const app = express();

// ✅ Stripe Configuration - TEST MODE ONLY (uses test cards)
const stripeMode = 'test'; // Force test mode
const stripeSecretKey = process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(stripeSecretKey);

// Log which mode is being used
console.log(`💳 Stripe Mode: ${stripeMode.toUpperCase()} (${stripeMode === 'live' ? 'REAL PAYMENTS' : 'TEST MODE - No real charges'})`);

// ✅ Stripe Webhook Route — must come before bodyParser
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // ✅ Use appropriate webhook secret based on mode
  const stripeMode = process.env.STRIPE_MODE || (process.env.NODE_ENV === 'production' ? 'live' : 'test');
  const webhookSecret = stripeMode === 'live'
    ? process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).send('Ignored non-completed event');
  }

  // ✅ Handle successful payment event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('💰 Payment successful for session:');
    console.log(JSON.stringify(session, null, 2));

    try {
      // ✅ 1. Prevent duplicate order creation
      const existingOrder = await Order.findOne({ sessionId: session.id });
      if (existingOrder) {
        console.log(`⚠️ Order already exists for session ${session.id}, skipping duplicate save.`);
        return res.status(200).send('Duplicate webhook ignored');
      }

      // ✅ 2. Parse item metadata safely
      let items = [];
      try {
        items = session.metadata ? JSON.parse(session.metadata.items || '[]') : [];
      } catch (parseErr) {
        console.error('❌ Failed to parse items metadata:', parseErr);
        items = [];
      }

      // ✅ 3. Convert all totals safely (use metadata from frontend)
      const clean = (v) => parseFloat(String(v || '0').replace(/[^\d.-]/g, '')) || 0;

      const subtotal = clean(session.metadata?.subtotal);
      const shippingFee = clean(session.metadata?.shippingFee);
      const tax = clean(session.metadata?.tax);
      const total = clean(session.metadata?.total) || subtotal + shippingFee + tax;

      // ✅ 4. Currency + status
      const currency = (session.metadata?.currency || session.currency || 'usd').toLowerCase();
      const paymentStatus = session.payment_status || 'unpaid';

      // ✅ 5. Convert total to USD for totalAmountUSD field
      // Exchange rates (matching frontend rates)
      const exchangeRates = {
        usd: 1,
        kes: 130,
        eur: 0.9,
        gbp: 0.8,
        cad: 1.35,
        inr: 83
      };
      const rate = exchangeRates[currency] || 1;
      const totalAmountUSD = total / rate;

      // ✅ 6. Create the order document
      const order = new Order({
        sessionId: session.id,
        customerEmail: session.customer_email || session.customer_details?.email || 'N/A',
        items,
        shipping: {
          country: session.metadata?.user_country || session.shipping_details?.address?.country || 'Unknown',
          currency,
          paymentStatus,
        },
        currency,
        subtotal,
        shippingFee,
        tax,
        total,
        totalAmountUSD: totalAmountUSD,
        totalAmountDisplay: total,
        paymentStatus,
      });

      await order.save();

      const displayTotal = Number(order.totalAmountDisplay ?? order.total ?? 0);
      console.log(
        `✅ Order saved (Webhook): ${order._id} (${currency.toUpperCase()} ${displayTotal.toFixed(2)})`
      );

      // ✅ Respond immediately so Stripe doesn't retry (prevents duplicate)
      return res.status(200).send('✅ Order saved successfully');

    
    } catch (err) {
      console.error('❌ Failed to save order (Webhook):', err);
      return res.status(500).send('Error processing order');
    }
  }

  res.status(200).send('✅ Webhook received');
});

// ✅ Middleware (after webhook)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// ✅ Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mysecretkey-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// ✅ Make cartCount available globally
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  res.locals.cartCount = req.session.cart.length;
  next();
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// ✅ Import Routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const apiRoutes = require('./routes/apiRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/', productRoutes);
app.use('/', userRoutes);
app.use('/', cartRoutes);
app.use('/', checkoutRoutes);
app.use('/', apiRoutes);
app.use('/', adminRoutes);

// ✅ Helper: Shipping Fee Calculation
function getShippingFee(country, currency) {
  const rates = {
    kenya: { usd: 3, kes: 300, eur: 2.8, gbp: 2.4 },
    usa: { usd: 10, kes: 1200, eur: 9.2, gbp: 8 },
    uk: { usd: 8, kes: 1000, eur: 7.4, gbp: 6.8 },
    canada: { usd: 9, kes: 1100, eur: 8.3, gbp: 7.2 },
    default: { usd: 12, kes: 1400, eur: 10.2, gbp: 9.1 },
  };
  const c = rates[country?.toLowerCase()] || rates.default;
  return c[currency] || c.usd;
}

// ✅ Stripe Checkout Session Route
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, country, currency, subtotal, shippingFee, tax, total } = req.body;
    
    // ✅ Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid.' });
    }
    
    if (!country || !currency) {
      return res.status(400).json({ error: 'Country and currency are required.' });
    }
    
    const stripeCurrency = (currency || 'usd').toLowerCase();

    const lineItems = [
      ...items.map(item => ({
        price_data: {
          currency: stripeCurrency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      {
        price_data: {
          currency: stripeCurrency,
          product_data: { name: `Shipping Fee (${country})` },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      },
    ];

    if (tax && tax > 0) {
      lineItems.push({
        price_data: {
          currency: stripeCurrency,
          product_data: { name: 'Tax' },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.DOMAIN || 'http://localhost:4000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN || 'http://localhost:4000'}/cancel`,
      currency: stripeCurrency,
      metadata: { items: JSON.stringify(items), user_country: country, subtotal, shippingFee, tax, total, currency: stripeCurrency },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});


// ✅ Clean success route — NO saving anymore
app.get('/success', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.redirect('/');

  try {
    const existingOrder = await Order.findOne({ sessionId });
    if (existingOrder) {
      console.log(`✅ Order found for ${sessionId}, redirecting to /order-success`);
      return res.redirect(`/order-success?id=${existingOrder._id}`);
    }

    // Fallback if webhook delay
    console.log('⏳ Waiting for webhook to finish saving order...');
    return res.send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="3">
          <title>Processing...</title>
          <style>
            body { font-family: Inter, sans-serif; text-align: center; padding: 4rem; color: #333; }
            .spinner {
              width: 60px; height: 60px;
              border: 6px solid #ccc;
              border-top: 6px solid #28a745;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2>Payment Successful!</h2>
          <p>We’re confirming your order. This page will refresh automatically.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ Error verifying success:', err);
    res.status(500).send('Error retrieving order.');
  }
});

// ✅ Final confirmation page
app.get('/order-success', async (req, res) => {
  try {
    const order = await Order.findById(req.query.id);
    if (!order) return res.redirect('/');

    // ✅ Clear cart after successful order
    req.session.cart = [];
    console.log('✅ Cart cleared after successful order');

    // ✅ Use saved values directly (no recalculation)
    const subtotal = order.subtotal ?? 0;
    const shippingFee = order.shippingFee ?? 0;
    const tax = order.tax ?? 0;
    const total = order.total ?? subtotal + shippingFee + tax;

    // 💱 Currency and USD conversion
    const currency = (order.currency || order.shipping?.currency || 'usd').toLowerCase();
    const fx = { kes: 130, eur: 0.9, gbp: 0.8, cad: 1.35, inr: 83, usd: 1 };
    const rate = fx[currency] || 1;
    const totalUSD = total / rate;

    // ✅ Currency symbol mapping
    const symbol =
      currency === 'kes' ? 'KES ' :
      currency === 'usd' ? '$' :
      currency === 'eur' ? '€ ' :
      currency === 'gbp' ? '£ ' :
      currency === 'cad' ? 'C$ ' :
      currency === 'inr' ? '₹ ' :
      '';

    res.render('order-success', {
      orderNumber: order._id,
      customerEmail: order.customerEmail,
      subtotal,
      shippingFee,
      tax,
      total,
      totalUSD,
      currency,
      symbol,
      paymentStatus: order.paymentStatus || order.shipping?.paymentStatus || 'paid',
      items: order.items,
      orderDate: order.createdAt.toLocaleDateString(),
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toLocaleDateString()
    });

  } catch (err) {
    console.error('❌ Error rendering order-success:', err);
    res.redirect('/');
  }
});
// ✅ Cancel route
app.get('/cancel', (req, res) => {
  res.render('cancel', { title: 'Payment Cancelled' });
});

// ✅ 404 Page
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));