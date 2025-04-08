const express = require('express');
const { getProducts, createProduct, fetchProductInfo, updateProduct, updateRating, deleteProduct, getBoughtProducts } = require('../controllers/productController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Got all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: No products found
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products/bought:
 *   get:
 *     summary: Get all bought products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Retrieved all bought products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: No bought products found
 */
router.get('/bought', getBoughtProducts)

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 */
router.post('/', createProduct);

/**
 * @swagger
 * /api/products/{barCode}:
 *   get:
 *     summary: Get product by bar code
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: barCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Product bar code
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:barCode', fetchProductInfo);

/**
 * @swagger
 * /api/products/{barCode}:
 *   put:
 *     summary: Update a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Product bar code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.put('/:barCode', authorize('admin', 'moderator'), updateProduct);

/**
 * @swagger
 * /api/products/{barCode}/rating:
 *   put:
 *     summary: Update product rating
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: barCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Product bar code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 4.5
 *     responses:
 *       200:
 *         description: Product rating updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.put('/:barCode/rating', updateRating);

/**
 * @swagger
 * /api/products/{barCode}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Product bar code
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:barCode', authorize('admin', 'moderator'), deleteProduct);

module.exports = router;
