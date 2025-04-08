const Invoice = require('../models/invoiceModel');
const Product = require('../models/productModel');
const Report = require('../models/reportModel');

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         sales:
 *           type: number
 *           example: 1000.00
 *         revenue:
 *           type: number
 *           example: 5000.00
 *         averageOrderPrice:
 *           type: number
 *           example: 50.00
 *         mostPurchasedProducts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 60d5f46b7b8e3f001c3b4d5f
 *               name:
 *                 type: string
 *                 example: Product Name
 *               purchaseCount:
 *                 type: number
 *                 example: 50
 *               barCode: 
 *                 type: string
 *                 example: 1234567890
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-10-16T12:34:56Z
 */

const generateReport = async (req, res) => {
  try {
    // 1. Calculate the total number of sales and total revenue
    const salesAndRevenueResult = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 }, // Count number of invoices (sales)
          totalRevenue: { $sum: '$totalAmount' }, // Sum the totalAmount for all invoices
        },
      },
    ]);

    const totalSales = salesAndRevenueResult[0]?.totalSales || 0;
    const totalRevenue = salesAndRevenueResult[0]?.totalRevenue || 0;

    // 2. Calculate the average order price
    const averageOrderPriceResult = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          averageOrderPrice: { $avg: '$totalAmount' },
        },
      },
    ]);

    const averageOrderPrice = averageOrderPriceResult[0]?.averageOrderPrice || 0;

    const mostPurchasedProducts = await Invoice.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId', // Changed from items._id
          purchaseCount: { $sum: '$items.quantity' },
        },
      },
      { $sort: { purchaseCount: -1 } },
      { $limit: 5 },
    ]);
    

    console.log("moste purchase",mostPurchasedProducts);

    const productsDetails = await Product.find({
      _id: { $in: mostPurchasedProducts.map((p) => p._id) },
    });

    console.log("detail produit",productsDetails);

    // First, modify the mostPurchasedProductsDetails mapping
    const mostPurchasedProductsDetails = productsDetails.map((product) => {
      const purchaseInfo = mostPurchasedProducts.find(p => p._id.toString() === product._id.toString());
      return {
        productId: product._id.toString(),
        name: product.name,
        barCode: product.barCode,
        purchaseCount: purchaseInfo.purchaseCount
      };
    });

    mostPurchasedProductsDetails.sort((a, b) => b.purchaseCount - a.purchaseCount);

    console.log("moste pruchase produit details",mostPurchasedProductsDetails);

    // Then the report creation stays the same
    const report = new Report({
      sales: totalSales,
      revenue: totalRevenue,
      averageOrderPrice,
      barCode: mostPurchasedProductsDetails.barCode,
      mostPurchasedProducts: mostPurchasedProductsDetails
    });

    console.log("report",report);


    await report.save();

    // 5. Return the report
    res.status(200).json({
      message: 'Report generated successfully',
      report,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

module.exports = {
  generateReport,
};
