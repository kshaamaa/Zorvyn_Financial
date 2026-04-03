import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { userService } from "../services";
import { Role } from "../types";
import { successResponse } from "../utils/response";
import { paginatedResponse, parsePagination } from "../utils/response";

export class UserController {
  /**
   * POST /api/users
   * Create a new user account (Admin only)
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body, req.user!.userId);

      res.status(StatusCodes.CREATED).json(
        successResponse("User created successfully", user)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users
   * List all users with pagination and optional search
   */
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, any>;
      const { page, limit } = parsePagination(q);
      const search = q.search as string | undefined;

      const { users, total } = await userService.listUsers(page, limit, search);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Users retrieved successfully",
        ...paginatedResponse(users, total, page, limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get a single user by ID
   */
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id as string);

      res.status(StatusCodes.OK).json(
        successResponse("User retrieved successfully", user)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id
   * Update user details
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(
        req.params.id as string,
        req.body,
        req.user!.userId
      );

      res.status(StatusCodes.OK).json(
        successResponse("User updated successfully", user)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/role
   * Update user's role
   */
  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateRole(
        req.params.id as string,
        req.body.role as Role,
        req.user!.userId
      );

      res.status(StatusCodes.OK).json(
        successResponse("User role updated successfully", user)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Soft delete a user
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.deleteUser(
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

export const userController = new UserController();
