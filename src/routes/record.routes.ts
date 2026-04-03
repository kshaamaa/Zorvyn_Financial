import { Router } from "express";
import { recordController } from "../controllers/record.controller";
import { authenticate } from "../middleware/auth";
import { adminOnly, analystAndAbove, allAuthenticated } from "../middleware/rbac";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema,
  idParamSchema,
} from "../utils/validators";

const router = Router();

// All record routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record (Admin only)
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000.00
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 example: INCOME
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *               description:
 *                 type: string
 *                 example: Monthly salary payment
 *     responses:
 *       201:
 *         description: Record created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  adminOnly,
  validateBody(createRecordSchema),
  recordController.createRecord
);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List financial records with filtering, search, pagination, and sorting
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in description and category
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, category, createdAt]
 *           default: date
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated list of financial records
 */
router.get(
  "/",
  analystAndAbove,
  validateQuery(recordQuerySchema),
  recordController.listRecords
);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single financial record
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Financial record details
 *       404:
 *         description: Record not found
 */
router.get(
  "/:id",
  analystAndAbove,
  validateParams(idParamSchema),
  recordController.getRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     summary: Update a financial record (Admin only)
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 *       404:
 *         description: Record not found
 */
router.patch(
  "/:id",
  adminOnly,
  validateParams(idParamSchema),
  validateBody(updateRecordSchema),
  recordController.updateRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a financial record (Admin only)
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Record soft deleted
 *       404:
 *         description: Record not found
 */
router.delete(
  "/:id",
  adminOnly,
  validateParams(idParamSchema),
  recordController.deleteRecord
);

export default router;
