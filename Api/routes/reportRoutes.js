// routes/reportRoutes.js
const express = require("express");
const { generateReport } = require("../controllers/reportController");
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all reports
/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Got all reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       400:
 *         description: No reports found
 */
router.get("/",authorize('admin','moderator'), generateReport);

module.exports = router;
