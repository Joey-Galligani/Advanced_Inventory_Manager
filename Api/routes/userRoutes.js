// ../routes/userRoutes.js
const express = require('express');
const { getProfile, updateProfile, deleteUser } = require('../controllers/userController');
const { authorizeSelf } = require('../middleware/authMiddleware');

const router = express.Router();

// Get User Profile Route (Protected)
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               \$ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/profile', getProfile);

// Update User Profile Route (Protected)
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.put('/profile',authorizeSelf, updateProfile);

// Delete User Account Route (Protected)

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/profile', deleteUser);

module.exports = router;
