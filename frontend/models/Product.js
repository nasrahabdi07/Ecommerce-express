const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String, // URL or /public/images path
    required: false
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Accessories',
      'Fitness',
      'Lifestyle',
      'Food & Beverage'
    ],
    default: 'Electronics'
  },
  stock: {
    type: Number,
    default: () => Math.floor(Math.random() * 50) + 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);