// routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // ✅ Correct path

const router = express.Router();

// 📝 Register (GET)
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', error: null });
});

// 📝 Register (POST)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      return res.render('register', { title: 'Register', error: 'All fields are required.' });
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render('register', { title: 'Register', error: 'Please enter a valid email address.' });
    }

    // ✅ Password strength validation
    if (password.length < 6) {
      return res.render('register', { title: 'Register', error: 'Password must be at least 6 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.render('register', { title: 'Register', error: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { title: 'Register', error: 'Email already registered.' });
    }

    // Save user
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Store success message in session
    req.session.successMessage = '✅ Account created successfully! Please log in.';
    res.redirect('/login');
  } catch (err) {
    console.error('❌ Error registering user:', err);
    let message = 'Something went wrong. Try again.';
if (err.name === 'ValidationError') {
  message = Object.values(err.errors).map(e => e.message).join(', ');
}
res.render('register', { title: 'Register', error: message });
  }
});

// 🔑 Login (GET)
router.get('/login', (req, res) => {
  const successMessage = req.session.successMessage;
  req.session.successMessage = null; // clear after showing
  res.render('login', { title: 'Login', error: null, successMessage });
});

// 🔑 Login (POST)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('login', { title: 'Login', error: 'Please enter both email and password.', successMessage: null });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { title: 'Login', error: 'Invalid email or password.', successMessage: null });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { title: 'Login', error: 'Invalid email or password.', successMessage: null });
    }

    req.session.userId = user._id;
    res.redirect('/products');
  } catch (err) {
    console.error('❌ Error logging in:', err);
    res.render('login', { title: 'Login', error: 'Something went wrong. Try again.', successMessage: null });
  }
});

// 🚪 Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;