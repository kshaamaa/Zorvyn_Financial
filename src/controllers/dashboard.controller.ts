import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { dashboardService } from "../services";
import { successResponse } from "../utils/response";

export class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Get overall financial summary (income, expenses, net, count)
   */
  async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.getSummary();

      res.status(StatusCodes.OK).json(
        successResponse("Dashboard summary retrieved successfully", summary)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/category-totals
   * Get totals grouped by category and type
   */
  async getCategoryTotals(_req: Request, res: Response, next: NextFunction) {
    try {
      const totals = await dashboardService.getCategoryTotals();

      res.status(StatusCodes.OK).json(
        successResponse("Category totals retrieved successfully", totals)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/trends
   * Get income/expense trends (monthly or weekly)
   */
  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, any>;
      const period = (q.period as "monthly" | "weekly") || "monthly";
      const months = parseInt(q.months as string) || 12;

      const trends = await dashboardService.getTrends(period, months);

      res.status(StatusCodes.OK).json(
        successResponse("Trends data retrieved successfully", trends)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/recent-activity
   * Get recent records and audit log entries
   */
  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, any>;
      const limit = parseInt(q.limit as string) || 10;
      const activity = await dashboardService.getRecentActivity(limit);

      res.status(StatusCodes.OK).json(
        successResponse("Recent activity retrieved successfully", activity)
      );
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
