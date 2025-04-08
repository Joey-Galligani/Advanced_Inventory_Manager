const mongoose = require('mongoose');
const Rating = require('./ratingModel');

// Define Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true
  },
  stock: {
    type: Number,
    required: false,
    default: 0
  },
  category: {
    type: String,
    required: false,
    trim: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  imageUrl: {
    type: String,
    required: false
  },
  barCode: {
    type: String,
    unique: true,
    required: true
  },
  ratings: {
    type: [Rating.schema],
    // type: [Number],
    default: []
  },
  averageRating: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update `updatedAt` field on modification
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate the average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length > 0) {
    const total = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = total / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
};

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
