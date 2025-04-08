const mongoose = require('mongoose');

// The objective is to generate a reports on sales and revenue
// The report will be generated based on the invoices

// Define Report schema
const reportSchema = new mongoose.Schema({
  sales: {
    type: Number,
    required: true
  },
  revenue: {
    type: Number,
    required: true
  },
  averageOrderPrice: {
    type: Number,
    required: true
  },
  mostPurchasedProducts: [
    {
      productId: {
        type: String,
        ref: 'Product',
        required: true,
      },
      barCode: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: false,
      },
      purchaseCount: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Report model
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;