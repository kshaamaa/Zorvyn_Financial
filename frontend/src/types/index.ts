// ─── Types matching the backend API ────────────────────

export type Role = "VIEWER" | "ANALYST" | "ADMIN";
export type RecordType = "INCOME" | "EXPENSE";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface FinancialRecord {
  id: string;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string };
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalRecords: number;
}

export interface CategoryTotal {
  category: string;
  type: string;
  total: number;
  count: number;
}

export interface TrendData {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  createdAt: string;
  user: { id: string; name: string };
}

export interface RecentActivity {
  recentRecords: FinancialRecord[];
  recentAuditLogs: AuditLog[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface RecordFilters {
  page?: number;
  limit?: number;
  type?: RecordType | "";
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateRecordData {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  description?: string;
}

export interface UpdateRecordData {
  amount?: number;
  type?: RecordType;
  category?: string;
  date?: string;
  description?: string;
}
