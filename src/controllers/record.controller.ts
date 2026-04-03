import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { recordService } from "../services";
import { RecordFilters } from "../types";
import { successResponse, paginatedResponse, parsePagination } from "../utils/response";

// Helper to safely get string from query param (Express v5 compat)
const qstr = (val: unknown): string | undefined =>
  typeof val === "string" ? val : undefined;

export class RecordController {
  /**
   * POST /api/records
   * Create a new financial record
   */
  async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.createRecord(req.body, req.user!.userId);

      res.status(StatusCodes.CREATED).json(
        successResponse("Financial record created successfully", record)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/records
   * List records with pagination, filtering, search, and sorting
   */
  async listRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, any>;
      const { page, limit } = parsePagination(q);

      const filters: RecordFilters = {};
      if (q.type) filters.type = q.type;
      if (q.category) filters.category = q.category;
      if (q.startDate) filters.startDate = new Date(q.startDate);
      if (q.endDate) filters.endDate = new Date(q.endDate);
      if (q.search) filters.search = q.search;
      if (q.minAmount) filters.minAmount = parseFloat(q.minAmount);
      if (q.maxAmount) filters.maxAmount = parseFloat(q.maxAmount);

      const sortBy = q.sortBy || "date";
      const sortOrder = (q.sortOrder as "asc" | "desc") || "desc";

      const { records, total } = await recordService.listRecords({
        page,
        limit,
        filters,
        sortBy,
        sortOrder,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Financial records retrieved successfully",
        ...paginatedResponse(records, total, page, limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/records/:id
   * Get a single record by ID
   */
  async getRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.getRecordById(req.params.id as string);

      res.status(StatusCodes.OK).json(
        successResponse("Financial record retrieved successfully", record)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/records/:id
   * Update a financial record
   */
  async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.updateRecord(
        req.params.id as string,
        req.body,
        req.user!.userId
      );

      res.status(StatusCodes.OK).json(
        successResponse("Financial record updated successfully", record)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/records/:id
   * Soft delete a financial record
   */
  async deleteRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordService.deleteRecord(
        req.params.id as string,
        req.user!.userId
      );

      res.status(StatusCodes.OK).json(
        successResponse(result.message)
      );
    } catch (error) {
      next(error);
    }
  }
}

export const recordController = new RecordController();
