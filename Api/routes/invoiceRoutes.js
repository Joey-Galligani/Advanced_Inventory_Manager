// ../routes/invoiceRoutes.js
const express = require("express");
const {
  getInvoices,
  createInvoice,
  fetchInvoiceInfo,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");

const router = express.Router();

// Routes for invoice management
/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Got all invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: No invoices found
 */
router.get("/", getInvoices);

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: The ID of the product
 *                     quantity:
 *                       type: number
 *                       description: The quantity of the product
 *                     price:
 *                       type: number
 *                       description: The price of the product
 *     responses:
 *       200:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Invalid input
 */
router.post("/", createInvoice);

/**
 * @swagger
 * /api/invoices/{invoiceId}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         schema:
 *           type: string
 *         required: true
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Invoice not found
 */
router.get("/:invoiceId", fetchInvoiceInfo);

/**
 * @swagger
 * /api/invoices/{invoiceId}:
 *   put:
 *     summary: Update an invoice
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         schema:
 *           type: string
 *         required: true
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: The ID of the product
 *                     quantity:
 *                       type: number
 *                       description: The quantity of the product
 *                     price:
 *                       type: number
 *                       description: The price of the product
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Invoice not found
 */
// router.put("/:invoiceId", updateInvoice);
router.put("/:invoiceId", updateInvoice);

/**
 * @swagger
 * /api/invoices/{invoiceId}:
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         schema:
 *           type: string
 *         required: true
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 */
router.delete("/:invoiceId", deleteInvoice);

module.exports = router;
