
const express = require("express");
const { createPaypalOrder, getOrderStatus, capturePayment } = require('../controllers/paypalController')
const { authenticateToken, authorize, authorizeSelf } = require('../middleware/authMiddleware')

const router = express.Router();

// Route to create a new PayPal order
router.post('/create-paypal-order', authenticateToken, createPaypalOrder);
// Route to get an order status
router.get('/get-order-status/:orderId', getOrderStatus)

// Route to capture a PayPal payment
router.post('/capture-payment/:orderId', capturePayment);

module.exports = router