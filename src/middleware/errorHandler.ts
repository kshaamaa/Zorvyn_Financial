import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/errors";
import { errorResponse } from "../utils/response";

/**
 * Global Error Handler Middleware
 * 
 * Catches all errors and returns a standardized JSON response.
 * Distinguishes between operational errors (expected) and programming errors.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("─── Error ───────────────────────────────");
    console.error(`Message: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    console.error("──────────────────────────────────────────");
  }

  // Operational errors (thrown intentionally)
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse(err.message)
    );
    return;
  }

  // Prisma known request errors
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaError = err as any;
    if (prismaError.code === "P2002") {
      res.status(StatusCodes.CONFLICT).json(
        errorResponse("A record with this value already exists")
      );
      return;
    }
    if (prismaError.code === "P2025") {
      res.status(StatusCodes.NOT_FOUND).json(
        errorResponse("Record not found")
      );
      return;
    }
  }

  // Prisma validation errors
  if (err.constructor.name === "PrismaClientValidationError") {
    res.status(StatusCodes.BAD_REQUEST).json(
      errorResponse("Invalid data provided")
    );
    return;
  }

  // JSON syntax errors (malformed request body)
  if (err instanceof SyntaxError && "body" in err) {
    res.status(StatusCodes.BAD_REQUEST).json(
      errorResponse("Invalid JSON in request body")
    );
    return;
  }

  // Unknown/unexpected errors
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
    errorResponse(
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message || "Internal server error"
    )
  );
};

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(StatusCodes.NOT_FOUND).json(
    errorResponse(`Route ${req.method} ${req.originalUrl} not found`)
  );
};
