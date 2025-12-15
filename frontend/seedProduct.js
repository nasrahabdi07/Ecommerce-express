const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected — seeding 60 categorized products...');

    await Product.deleteMany();

    const products = [
      // 🧠 ELECTRONICS
      { name: 'Wireless Headphones', price: 149.99, description: 'Beats Studio Pro wireless headphones with noise cancellation.', image: '/images/headphones.webp', category: 'Electronics' },
      { name: 'Smart Fitness Watch', price: 199.99, description: 'Track your health metrics with this advanced smartwatch.', image: '/images/smartwatch.jpg', category: 'Electronics' },
      { name: 'Mechanical Keyboard', price: 89.99, description: 'RGB backlit mechanical keyboard for gaming and productivity.', image: '/images/mechanicalkeyboard.jpg', category: 'Electronics' },
      { name: 'Portable Bluetooth Speaker', price: 79.99, description: 'Compact speaker with deep bass and long battery life.', image: '/images/portablespeaker.jpg', category: 'Electronics' },
      { name: 'Webcam HD 1080p', price: 49.99, description: 'Crystal clear HD webcam for meetings and streaming.', image: '/images/webcam.jpg', category: 'Electronics' },
      { name: 'Wireless Earbuds', price: 59.99, description: 'True wireless earbuds with active noise cancellation.', image: '/images/earbuds.jpg', category: 'Electronics' },
      { name: 'USB-C Charger', price: 24.99, description: 'Fast 25W wall charger for all USB-C devices.', image: '/images/USB-C Charger.jpeg.webp', category: 'Electronics' },
      { name: 'Power Bank 20000mAh', price: 39.99, description: 'High-capacity portable charger with fast output.', image: '/images/powerbank.webp.jpeg', category: 'Electronics' },
      { name: 'Wireless Mouse', price: 19.99, description: 'Ergonomic rechargeable mouse with silent clicks.', image: '/images/wirelessmouse.png', category: 'Electronics' },
      { name: '4K Monitor 27-inch', price: 299.99, description: 'Ultra HD monitor for sharp visuals and productivity.', image: '/images/monitor.jpg', category: 'Electronics' },
      { name: 'Smart Home Security Camera', price: 89.99, description: 'Indoor smart Wi-Fi camera with motion detection and night vision.', image: '/images/securitycam.jpg', category: 'Electronics' },
      { name: 'Smart LED Bulb', price: 29.99, description: 'Wi-Fi enabled LED bulb with adjustable brightness.', image: '/images/bulb.webp', category: 'Electronics' },

      // 👜 ACCESSORIES
      { name: 'Laptop Backpack', price: 49.99, description: 'Durable Lenovo 15.6” laptop backpack.', image: '/images/backpack.png', category: 'Accessories' },
      { name: 'Phone Stand', price: 12.99, description: 'Adjustable aluminum phone stand for desks.', image: '/images/phone stand.jpg', category: 'Accessories' },
      { name: 'External Hard Drive (1TB)', price: 79.99, description: 'Portable 1TB USB 3.0 external drive.', image: '/images/externalharddrive.jpeg', category: 'Accessories' },
      { name: 'Stylish Laptop Sleeve', price: 29.99, description: 'Slim-fit protective laptop sleeve with padding.', image: '/images/Laptopsleeve1.jpg.webp', category: 'Accessories' },
      { name: 'Cable Organizer', price: 14.99, description: 'Compact travel case for cables and gadgets.', image: '/images/cableorganizer.jpg', category: 'Accessories' },
      { name: 'Leather Wallet', price: 39.99, description: 'Premium handcrafted leather wallet.', image: '/images/leatherwallet.jpg', category: 'Accessories' },
      { name: 'Keychain Tracker', price: 34.99, description: 'Bluetooth tracker for locating your keys easily.', image: '/images/keychaintracker.jpg', category: 'Accessories' },
      { name: 'Desk Organizer Set', price: 59.99, description: 'Wooden desk organizer with pen and phone slots.', image: '/images/DeskOrganizerset.jpg', category: 'Accessories' },
      { name: 'Wireless Charging Pad', price: 29.99, description: 'Qi-compatible wireless charging pad.', image: '/images/wirelesschargingpad.jpg', category: 'Accessories' },
      { name: 'Smart Glasses Case', price: 24.99, description: 'Compact anti-scratch smart glasses case.', image: '/images/smartglassescase.jpg', category: 'Accessories' },
      { name: 'Mouse Pad XL', price: 15.99, description: 'Large non-slip surface mouse pad.', image: '/images/mousepad.jpeg.webp', category: 'Accessories' },
      { name: 'USB Hub (4-Port)', price: 19.99, description: 'High-speed USB hub for multiple devices.', image: '/images/USB hub.jpg', category: 'Accessories' },

      // 💪 FITNESS
      { name: 'Yoga Mat Premium', price: 49.99, description: 'Non-slip yoga mat for your daily practice.', image: '/images/yogamats.jpeg', category: 'Fitness' },
      { name: 'Resistance Bands Set', price: 29.99, description: '5-level resistance bands for strength workouts.', image: '/images/resistance bands.jpg', category: 'Fitness' },
      { name: 'Dumbbell Set 10kg', price: 79.99, description: 'Adjustable dumbbells for home gym workouts.', image: '/images/dumbbells.jpg', category: 'Fitness' },
      { name: 'Foam Roller', price: 24.99, description: 'High-density roller for muscle recovery.', image: '/images/foamroller.jpg', category: 'Fitness' },
      { name: 'Skipping Rope Pro', price: 14.99, description: 'Tangle-free skipping rope with speed bearings.', image: '/images/skippingrope.jpeg', category: 'Fitness' },
      { name: 'Smart Water Bottle', price: 39.99, description: 'Tracks your hydration levels throughout the day.', image: '/images/smartwaterbottle.jpg', category: 'Fitness' },
      { name: 'Fitness Tracker Band', price: 69.99, description: 'Monitor heart rate, sleep, and calories burned.', image: '/images/fitnessband.jpg.avif', category: 'Fitness' },
      { name: 'Gym Gloves', price: 19.99, description: 'Breathable grip gloves for heavy lifting.', image: '/images/gymgloves.webp', category: 'Fitness' },
      { name: 'Workout Shorts', price: 24.99, description: 'Lightweight moisture-wicking gym shorts.', image: '/images/workoutshorts.jpeg.webp', category: 'Fitness' },
      { name: 'Protein Shaker Bottle', price: 12.99, description: 'Leak-proof shaker for smoothies and shakes.', image: '/images/proteinshakebottle.jpg', category: 'Fitness' },
      { name: 'Running Armband', price: 15.99, description: 'Adjustable phone armband for running.', image: '/images/running armband.jpeg', category: 'Fitness' },
      { name: 'Push-Up Bars', price: 34.99, description: 'Steel push-up handles for bodyweight training.', image: '/images/pushup-bars-side-to-side-pushups.webp', category: 'Fitness' },

      // 🏡 LIFESTYLE
      { name: 'Eco-Friendly Water Bottle', price: 19.99, description: 'Sustainable stainless steel water bottle.', image: '/images/ecofriendlybottle.jpg', category: 'Lifestyle' },
      { name: 'Aroma Diffuser', price: 39.99, description: 'Relax with calming scents for better sleep.', image: '/images/diffusers.jpg.webp', category: 'Lifestyle' },
      { name: 'Indoor Plant Pot', price: 24.99, description: 'Ceramic pot for your indoor plants.', image: '/images/deskplants.jpeg', category: 'Lifestyle' },
      { name: 'Scented Candle Set', price: 29.99, description: 'Set of 3 soothing soy candles.', image: '/images/scentedcandles.jpg.webp', category: 'Lifestyle' },
      { name: 'Wall Clock Modern', price: 49.99, description: 'Minimalist wall clock with silent movement.', image: '/images/wallclock.jpg.webp', category: 'Lifestyle' },
      { name: 'Throw Blanket', price: 44.99, description: 'Cozy fleece blanket for comfort.', image: '/images/throwblankets.jpg.avif', category: 'Lifestyle' },
      { name: 'Table Lamp', price: 59.99, description: 'Warm LED lamp with wooden base.', image: '/images/desklamp.jpg', category: 'Lifestyle' },
      { name: 'Decorative Vase', price: 34.99, description: 'Elegant ceramic vase for home decor.', image: 'images/vase.jpg', category: 'Lifestyle' },
      { name: 'Wall Art Canvas', price: 69.99, description: 'Framed wall art to elevate your space.', image: '/images/canvas.jpg', category: 'Lifestyle' },
      { name: 'Bamboo Cutlery Set', price: 19.99, description: 'Reusable eco-friendly cutlery kit.', image: 'images/bamboset.jpg', category: 'Lifestyle' },
      { name: 'Travel Mug', price: 22.99, description: 'Insulated stainless steel mug for coffee lovers.', image: '/images/mugs.jpg.webp', category: 'Lifestyle' },
      { name: 'Desk Plant Set', price: 35.99, description: 'Set of 3 small potted plants for your workspace.', image: '/images/deskplantset.jpg.webp', category: 'Lifestyle' },

      // 🍵 FOOD & BEVERAGE
      { name: 'Organic Coffee Beans', price: 24.99, description: 'Premium coffee beans from sustainable farms.', image: '/images/coffee.webp', category: 'Food & Beverage' },
      { name: 'Green Tea Pack', price: 19.99, description: 'Organic green tea with antioxidants.', image: '/images/greentea.jpg.avif', category: 'Food & Beverage' },
      { name: 'Protein Snack Bars', price: 29.99, description: 'Healthy protein bars with nuts and honey.', image: '/images/proteinsnackbar.webp', category: 'Food & Beverage' },
      { name: 'Oatmeal Pack', price: 9.99, description: 'Whole-grain oats for a healthy breakfast.', image: '/images/oatmeal.jpg', category: 'Food & Beverage' },
      { name: 'Dark Chocolate 85%', price: 6.99, description: 'Rich dark chocolate with minimal sugar.', image: '/images/darkchocolate.jpg.webp', category: 'Food & Beverage' },
      { name: 'Energy Drink', price: 3.99, description: 'Refreshing energy drink with natural caffeine.', image: '/images/Energy_drinks_of_various_brands_02.jpg', category: 'Food & Beverage' },
      { name: 'Instant Coffee Sachets', price: 8.99, description: 'Convenient instant coffee sticks for travel.', image: '/images/instantcoffee.jpg', category: 'Food & Beverage' },
      { name: 'Almond Milk 1L', price: 4.99, description: 'Lactose-free plant-based almond milk.', image: '/images/almondmilk.jpg.avif', category: 'Food & Beverage' },
    ];

    await Product.insertMany(products);
    console.log('✅ 56 categorized products seeded successfully!');
    process.exit();
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));

  