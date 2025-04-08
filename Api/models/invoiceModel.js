const mongoose = require('mongoose');

// Define Invoice schema

const invoiceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  items: [
    {
      productId: {
        type: String,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    required: true,
  },
});

// Create and export the Invoice model
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;