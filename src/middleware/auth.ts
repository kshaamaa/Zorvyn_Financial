import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { JwtPayload } from "../types";
import { UnauthorizedError } from "../utils/errors";
import prisma from "../config/database";

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token and attaches user info to request
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Access token is required. Provide a Bearer token in the Authorization header.");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Invalid token format");
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User account not found or has been deleted");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedError("User account is inactive. Contact an administrator.");
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid or expired token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token has expired. Please login again."));
    } else {
      next(new UnauthorizedError("Authentication failed"));
    }
  }
};
