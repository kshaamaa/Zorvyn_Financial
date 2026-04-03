import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "../services";
import { successResponse } from "../utils/response";

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user account
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register({ email, password, name });

      res.status(StatusCodes.CREATED).json(
        successResponse("User registered successfully", result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.status(StatusCodes.OK).json(
        successResponse("Login successful", result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user's profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);

      res.status(StatusCodes.OK).json(
        successResponse("Profile retrieved successfully", user)
      );
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
