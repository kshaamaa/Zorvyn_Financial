import { Request, Response, NextFunction } from "express";
import { Role } from "../types";
import { ForbiddenError } from "../utils/errors";

/**
 * Role-Based Access Control (RBAC) Middleware Factory
 * 
 * Creates middleware that restricts access to specified roles.
 * Must be used AFTER the authenticate middleware.
 * 
 * Role Hierarchy:
 *   ADMIN   → Full access (CRUD records, manage users)
 *   ANALYST → Read records + access summaries/insights
 *   VIEWER  → View dashboard data only
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError("Authentication required before authorization"));
    }

    const userRole = req.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${userRole}`
        )
      );
    }

    next();
  };
};

/**
 * Convenience role check helpers
 */
export const adminOnly = authorize(Role.ADMIN);
export const analystAndAbove = authorize(Role.ANALYST, Role.ADMIN);
export const allAuthenticated = authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN);
