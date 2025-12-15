# 📚 Complete Project Explanation - E-Commerce Website

## 🎯 Project Overview

This is a **full-stack e-commerce web application** built with Node.js and Express. It allows customers to browse products, add items to cart, and make purchases using Stripe payment processing.

**Key Features:**
- User authentication (register/login)
- Product browsing with categories and pagination
- Shopping cart functionality
- Multi-currency checkout (USD, KES, GBP, CAD, EUR, INR)
- Stripe payment integration (Test Mode)
- Order management
- International shipping support

---

## 🏗️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database (using Mongoose)
- **Stripe** - Payment processing (Test Mode)
- **Express-Session** - Session management
- **bcrypt** - Password hashing
- **EJS** - Template engine for views

### Frontend
- **HTML/CSS/JavaScript** - Client-side
- **EJS Templates** - Server-side rendering
- **Fetch API** - AJAX requests

### Database
- **MongoDB** - NoSQL database
- Collections: `users`, `products`, `orders`

---

## 📁 Project Structure

```
ecommerce-express/
├── server.js              # Main server file
├── models/               # Database models
│   ├── User.js          # User schema
│   ├── Product.js       # Product schema
│   └── Order.js         # Order schema
├── routes/               # Route handlers
│   ├── productRoutes.js # Product pages
│   ├── userRoutes.js    # Authentication
│   ├── cartRoutes.js    # Shopping cart
│   ├── checkoutRoutes.js # Checkout page
│   └── apiRoutes.js     # API endpoints
├── views/                # EJS templates
│   ├── index.ejs        # Homepage
│   ├── products.ejs     # Product listing
│   ├── cart.ejs         # Shopping cart
│   ├── checkout.ejs     # Checkout page
│   └── order-success.ejs # Order confirmation
├── public/               # Static files
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── images/         # Product images
└── .env                 # Environment variables
```

---

## 🔄 Application Flow

### 1. **User Registration & Login**

**Flow:**
```
User visits /register
  ↓
Fills registration form (name, email, password)
  ↓
Password is hashed with bcrypt
  ↓
User saved to MongoDB (users collection)
  ↓
Redirected to /login
  ↓
User logs in with credentials
  ↓
Session created (req.session.userId)
  ↓
Redirected to /products
```

**Files Involved:**
- `routes/userRoutes.js` - Handles registration/login
- `models/User.js` - User schema with password hashing
- `views/register.ejs` & `views/login.ejs` - Forms

**Security:**
- Passwords hashed with bcrypt (salt rounds: 10)
- Email validation (regex)
- Password minimum length (6 characters)
- Session-based authentication

---

### 2. **Product Browsing**

**Flow:**
```
User visits /products
  ↓
Server queries MongoDB for products
  ↓
Applies filters (category, sorting, pagination)
  ↓
Renders products.ejs with product data
  ↓
User can click "Add to Cart" button
```

**Features:**
- **Pagination:** 8 products per page
- **Categories:** Electronics, Accessories, Fitness, Lifestyle, Food & Beverage
- **Sorting:** By price, date, name (ascending/descending)
- **Filtering:** By category

**Files Involved:**
- `routes/productRoutes.js` - Product listing logic
- `models/Product.js` - Product schema
- `views/products.ejs` - Product display

---

### 3. **Shopping Cart**

**Flow:**
```
User clicks "Add to Cart" on product
  ↓
AJAX POST request to /cart/add/:id
  ↓
Product added to req.session.cart (session storage)
  ↓
Cart count updated in navbar
  ↓
User can view cart at /cart
  ↓
Can update quantities or remove items
```

**Features:**
- **Session-based cart** - Stored in server session
- **Quantity management** - Increase/decrease items
- **Stock validation** - Prevents adding more than available
- **Real-time updates** - Cart count in navbar

**Files Involved:**
- `routes/cartRoutes.js` - Cart operations
- `public/js/checkout.js` - Frontend cart logic
- `views/cart.ejs` - Cart display

**Data Structure:**
```javascript
req.session.cart = [
  {
    _id: "product_id",
    name: "Product Name",
    price: 29.99,
    quantity: 2,
    image: "/images/product.jpg",
    stock: 50
  }
]
```

---

### 4. **Checkout Process**

**Flow:**
```
User clicks "Checkout" from cart
  ↓
Redirected to /checkout
  ↓
Fills shipping information (name, address, country, etc.)
  ↓
Selects country → Currency auto-updates (Kenya → KES, USA → USD)
  ↓
Fills payment information (card details)
  ↓
Reviews order summary
  ↓
Clicks "Place Order"
```

**Multi-Currency System:**
- **Country Selection** → Auto-selects currency
  - Kenya → KES (Kenyan Shilling)
  - USA → USD (US Dollar)
  - UK → GBP (British Pound)
  - Canada → CAD (Canadian Dollar)
  - India → INR (Indian Rupee)
  - France/Germany → EUR (Euro)

- **Exchange Rates:** Fetched from API (with fallback)
- **Price Conversion:** All prices converted to selected currency
- **Shipping Fees:** Calculated based on country and currency
- **Tax Calculation:** Country-specific tax rates

**Files Involved:**
- `routes/checkoutRoutes.js` - Checkout page
- `public/js/checkout.js` - Checkout logic & currency conversion
- `views/checkout.ejs` - Checkout form

---

### 5. **Payment Processing (Stripe)**

**Flow:**
```
User clicks "Place Order"
  ↓
Frontend calculates totals in selected currency
  ↓
POST request to /create-checkout-session
  ↓
Server creates Stripe Checkout Session
  ↓
Returns Stripe payment URL
  ↓
User redirected to Stripe payment page
  ↓
User enters test card: 4242 4242 4242 4242
  ↓
Stripe processes payment (Test Mode - no real charge)
  ↓
Stripe sends webhook to /webhook endpoint
  ↓
Server verifies webhook signature
  ↓
Order saved to MongoDB (orders collection)
  ↓
User redirected to /success
  ↓
Then redirected to /order-success
  ↓
Cart cleared automatically
```

**Stripe Integration:**
- **Mode:** Test Mode (uses test cards only)
- **Test Card:** `4242 4242 4242 4242`
- **Webhook:** Receives payment confirmation from Stripe
- **Security:** Webhook signature verification

**Files Involved:**
- `server.js` - Stripe routes (`/create-checkout-session`, `/webhook`)
- `public/js/checkout.js` - Payment initiation
- `models/Order.js` - Order schema

**Stripe Test Mode:**
- No real money charged
- Perfect for development and testing
- Uses test API keys (start with `sk_test_`)

---

### 6. **Order Management**

**Flow:**
```
Payment successful via Stripe webhook
  ↓
Order document created in MongoDB
  ↓
Stores:
  - Customer email
  - Items purchased
  - Shipping address
  - Payment amount (in selected currency)
  - USD equivalent (for reporting)
  - Payment status
  ↓
User sees order confirmation page
  ↓
Order details displayed
```

**Order Schema:**
```javascript
{
  sessionId: "stripe_session_id",
  customerEmail: "customer@example.com",
  items: [
    { name: "Product Name", quantity: 2, price: 29.99 }
  ],
  shipping: {
    country: "Kenya",
    currency: "kes",
    paymentStatus: "paid"
  },
  currency: "kes",
  subtotal: 59.98,
  shippingFee: 2600,
  tax: 831.58,
  total: 8628.98,
  totalAmountUSD: 66.38,  // Converted to USD
  paymentStatus: "paid",
  createdAt: Date
}
```

**Files Involved:**
- `models/Order.js` - Order schema
- `server.js` - Webhook handler & order creation
- `views/order-success.ejs` - Order confirmation

---

## 💾 Database Structure

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String (enum),
  stock: Number,
  createdAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  sessionId: String (Stripe session ID),
  customerEmail: String,
  items: Array,
  shipping: Object,
  currency: String,
  subtotal: Number,
  shippingFee: Number,
  tax: Number,
  total: Number,
  totalAmountUSD: Number,
  paymentStatus: String,
  createdAt: Date
}
```

---

## 🔐 Security Features

1. **Password Hashing**
   - Uses bcrypt with salt rounds: 10
   - Passwords never stored in plain text

2. **Session Management**
   - Secure session cookies
   - Session secret in environment variables
   - Session-based authentication

3. **Input Validation**
   - Email format validation
   - Password strength requirements
   - Stock availability checks
   - Empty cart validation

4. **Stripe Webhook Security**
   - Signature verification
   - Prevents duplicate order creation
   - Secure payment processing

5. **Environment Variables**
   - Sensitive data in `.env` file
   - Not committed to version control
   - API keys kept secret

---

## 🌍 Multi-Currency System

### How It Works:

1. **User selects country** → Currency auto-selected
2. **Exchange rates fetched** from API (with fallback)
3. **Prices converted** to selected currency
4. **Shipping fees** calculated in selected currency
5. **Tax calculated** on converted amount
6. **Total displayed** in selected currency
7. **Stripe receives** amount in selected currency
8. **Order saved** with both:
   - Amount in selected currency
   - USD equivalent (for reporting)

### Exchange Rates (Fallback):
- USD: 1
- KES: 130
- EUR: 0.9
- GBP: 0.8
- CAD: 1.35
- INR: 83

### Shipping Fees (by country):
- Kenya: KES 2,600 / USD 20
- USA: USD 10
- UK: GBP 6.8
- Canada: CAD 9
- Default: USD 12

---

## 🔄 Session Management

**How Sessions Work:**
- User logs in → `req.session.userId` set
- Cart stored in → `req.session.cart`
- Session persists across requests
- Session destroyed on logout
- Cart cleared after successful order

**Session Configuration:**
```javascript
{
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true in production with HTTPS
}
```

---

## 📊 Key Routes

### Public Routes
- `GET /` - Homepage
- `GET /products` - Product listing
- `GET /products/:id` - Product details
- `GET /cart` - Shopping cart
- `GET /checkout` - Checkout page
- `GET /register` - Registration page
- `GET /login` - Login page

### Protected Routes
- `GET /logout` - Logout (destroys session)

### API Routes
- `POST /cart/add/:id` - Add item to cart
- `POST /cart/update/:id` - Update cart quantity
- `POST /cart/remove/:id` - Remove from cart
- `GET /api/cart` - Get cart JSON
- `GET /cart-count` - Get cart count

### Payment Routes
- `POST /create-checkout-session` - Create Stripe session
- `POST /webhook` - Stripe webhook handler
- `GET /success` - Payment success (redirects)
- `GET /order-success` - Order confirmation page
- `GET /cancel` - Payment cancelled

---

## 🧪 Testing

### Test Cards (Stripe Test Mode)
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVV:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

### Test Flow
1. Register a test account
2. Login
3. Browse products
4. Add items to cart
5. Go to checkout
6. Fill shipping info
7. Select country (currency auto-updates)
8. Fill payment form
9. Use test card: `4242 4242 4242 4242`
10. Complete payment
11. Verify order in MongoDB
12. Check cart is cleared

---

## 🎯 Key Features Explained

### 1. **Stock Management**
- Prevents adding more items than available
- Validates stock when updating quantities
- Shows error messages for stock limits

### 2. **Currency Conversion**
- Real-time price conversion
- Exchange rates from API
- Fallback rates if API fails
- Accurate calculations

### 3. **Order Tracking**
- Each order has unique ID
- Linked to Stripe session ID
- Prevents duplicate orders
- Full order history in database

### 4. **Error Handling**
- Try-catch blocks for async operations
- User-friendly error messages
- Console logging for debugging
- Graceful error recovery

---

## 📝 Environment Variables

Required `.env` file:
```env
MONGO_URI=mongodb://127.0.0.1:27017/ecommerceDB
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SESSION_SECRET=your-secret-key
PORT=4000
NODE_ENV=development
```

---

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB:**
   - Ensure MongoDB is running
   - Connection string in `.env`

3. **Seed products (optional):**
   ```bash
   node seedProduct.js
   ```

4. **Start server:**
   ```bash
   npm run dev  # Development mode with auto-reload
   # or
   npm start    # Production mode
   ```

5. **Access application:**
   - Open browser: `http://localhost:4000`

---

## 🎓 For Your Lecturer

### What This Project Demonstrates:

1. **Full-Stack Development**
   - Server-side (Node.js/Express)
   - Client-side (HTML/CSS/JavaScript)
   - Database integration (MongoDB)

2. **Payment Integration**
   - Stripe API integration
   - Webhook handling
   - Secure payment processing

3. **User Authentication**
   - Registration/login system
   - Password hashing
   - Session management

4. **E-Commerce Features**
   - Product catalog
   - Shopping cart
   - Checkout process
   - Order management

5. **Multi-Currency Support**
   - International payments
   - Currency conversion
   - Country-specific pricing

6. **Security Best Practices**
   - Password hashing
   - Input validation
   - Secure sessions
   - Environment variables

### Technical Skills Demonstrated:
- ✅ RESTful API design
- ✅ Database modeling (MongoDB/Mongoose)
- ✅ Payment gateway integration
- ✅ Session management
- ✅ Security implementation
- ✅ Error handling
- ✅ Multi-currency systems
- ✅ Real-time updates (AJAX)
- ✅ Template rendering (EJS)

---

## 📊 Data Flow Diagram

```
User Browser
    ↓
Express Server (server.js)
    ↓
Routes (routes/*.js)
    ↓
Models (models/*.js)
    ↓
MongoDB Database
    ↓
Stripe API (Payment Processing)
    ↓
Webhook → Order Saved
```

---

## 🔍 Important Code Sections

### 1. Stripe Checkout Creation
**Location:** `server.js` - `/create-checkout-session`
- Validates cart
- Creates Stripe session
- Converts prices to selected currency
- Returns payment URL

### 2. Webhook Handler
**Location:** `server.js` - `/webhook`
- Verifies Stripe signature
- Prevents duplicate orders
- Saves order to database
- Converts currency to USD

### 3. Currency Conversion
**Location:** `public/js/checkout.js`
- Fetches exchange rates
- Converts all prices
- Updates UI in real-time
- Sends converted amounts to Stripe

### 4. Cart Management
**Location:** `routes/cartRoutes.js`
- Session-based storage
- Stock validation
- Quantity updates
- Real-time cart count

---

## ✅ Project Completion Checklist

- [x] User authentication (register/login)
- [x] Product browsing with filters
- [x] Shopping cart functionality
- [x] Multi-currency checkout
- [x] Stripe payment integration
- [x] Order management
- [x] Stock validation
- [x] Error handling
- [x] Security implementation
- [x] Responsive design
- [x] Session management
- [x] Database integration

---

## 🎯 Summary

This is a **complete, production-ready e-commerce application** that demonstrates:
- Full-stack web development
- Payment processing integration
- Database management
- Security best practices
- Multi-currency support
- User authentication
- Real-world e-commerce features

**Perfect for demonstrating:**
- Backend development skills
- API integration
- Database design
- Payment processing
- Security implementation
- Full application architecture

---



