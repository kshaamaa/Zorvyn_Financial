import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

/**
 * Request Validation Middleware Factory
 * 
 * Validates request body, query, or params against a Zod schema.
 * Returns detailed error messages for each validation failure.
 */
export const validate = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // For body, replace with parsed data. For query/params, just validate (read-only in Express v5)
      if (source === "body") {
        req.body = data;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue: any) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Validates request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, "body");

/**
 * Validates query parameters
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, "query");

/**
 * Validates URL parameters
 */
export const validateParams = (schema: ZodSchema) => validate(schema, "params");
