import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth";
import { analystAndAbove, allAuthenticated } from "../middleware/rbac";
import { validateQuery } from "../middleware/validate";
import { trendQuerySchema } from "../utils/validators";

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial summary (total income, expenses, net balance)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpenses:
 *                   type: number
 *                 netBalance:
 *                   type: number
 *                 totalRecords:
 *                   type: integer
 *       403:
 *         description: Analyst or Admin role required
 */
router.get("/summary", allAuthenticated, dashboardController.getSummary);

/**
 * @swagger
 * /api/dashboard/category-totals:
 *   get:
 *     summary: Get totals grouped by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category-wise totals
 *       403:
 *         description: Analyst or Admin role required
 */
router.get(
  "/category-totals",
  allAuthenticated,
  dashboardController.getCategoryTotals
);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get income/expense trends over time
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, weekly]
 *           default: monthly
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of months to look back
 *     responses:
 *       200:
 *         description: Trend data grouped by period
 *       403:
 *         description: Analyst or Admin role required
 */
router.get(
  "/trends",
  allAuthenticated,
  validateQuery(trendQuerySchema),
  dashboardController.getTrends
);

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent records and audit log activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent activity data
 */
router.get(
  "/recent-activity",
  allAuthenticated,
  dashboardController.getRecentActivity
);

export default router;
