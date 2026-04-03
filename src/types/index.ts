// ─── Role Enum ─────────────────────────────────────────
export enum Role {
  VIEWER = "VIEWER",
  ANALYST = "ANALYST",
  ADMIN = "ADMIN",
}

// ─── User Status ───────────────────────────────────────
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ─── Financial Record Type ─────────────────────────────
export enum RecordType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

// ─── Audit Actions ─────────────────────────────────────
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
}

// ─── JWT Payload ───────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// ─── Express Request Extension ─────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── Pagination ────────────────────────────────────────
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Financial Record Filters ──────────────────────────
export interface RecordFilters {
  type?: RecordType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ─── Dashboard Summary ─────────────────────────────────
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalRecords: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  count: number;
  type: string;
}

export interface TrendData {
  period: string;
  income: number;
  expense: number;
  net: number;
}

// ─── API Response Wrapper ──────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
