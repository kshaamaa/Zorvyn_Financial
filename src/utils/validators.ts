import { z } from "zod";

// ─── Auth Schemas ──────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters"),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

// ─── User Schemas ──────────────────────────────────────

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    error: "Status must be ACTIVE or INACTIVE",
  }).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export const updateRoleSchema = z.object({
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"], {
    error: "Role must be VIEWER, ANALYST, or ADMIN",
  }),
});

export const createUserSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters"),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"], {
    error: "Role must be VIEWER, ANALYST, or ADMIN",
  }).default("VIEWER"),
});

// ─── Financial Record Schemas ──────────────────────────

const VALID_CATEGORIES = [
  "Salary", "Freelance", "Investment", "Rent", "Mortgage",
  "Utilities", "Groceries", "Food", "Transportation", "Healthcare",
  "Insurance", "Entertainment", "Shopping", "Education", "Travel",
  "Subscription", "Taxes", "Gifts", "Charity", "Other",
] as const;

export const createRecordSchema = z.object({
  amount: z
    .number({ error: "Amount is required and must be a number" })
    .positive("Amount must be a positive number")
    .max(999999999.99, "Amount exceeds maximum allowed value"),
  type: z.enum(["INCOME", "EXPENSE"], {
    error: "Type must be INCOME or EXPENSE",
  }),
  category: z.enum(VALID_CATEGORIES, {
    error: "Category must be one of the valid categories",
  }),
  date: z
    .string({ error: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Use ISO 8601 format (e.g., 2026-04-01)",
    }),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
});

export const updateRecordSchema = z.object({
  amount: z
    .number({ error: "Amount must be a number" })
    .positive("Amount must be a positive number")
    .max(999999999.99, "Amount exceeds maximum allowed value")
    .optional(),
  type: z.enum(["INCOME", "EXPENSE"], {
    error: "Type must be INCOME or EXPENSE",
  }).optional(),
  category: z.enum(VALID_CATEGORIES, {
    error: "Category must be one of the valid categories",
  }).optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Use ISO 8601 format (e.g., 2026-04-01)",
    })
    .optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

// ─── Query Schemas ─────────────────────────────────────

export const recordQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid startDate format" }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid endDate format" }).optional(),
  search: z.string().max(200, "Search term too long").optional(),
  minAmount: z.string().regex(/^\d+(\.\d+)?$/, "minAmount must be a number").optional(),
  maxAmount: z.string().regex(/^\d+(\.\d+)?$/, "maxAmount must be a number").optional(),
  sortBy: z.enum(["date", "amount", "category", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const trendQuerySchema = z.object({
  period: z.enum(["weekly", "monthly"], {
    error: "Period must be weekly or monthly",
  }).optional(),
  months: z.string().regex(/^\d+$/, "Months must be a positive integer").optional(),
});

// ─── Param Schemas ─────────────────────────────────────

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format. Must be a valid UUID"),
});
