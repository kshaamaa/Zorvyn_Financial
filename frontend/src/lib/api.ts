import { getToken, clearAuth } from "./storage";

const BASE_URL ="/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params } = options;

  let url = `${BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data as T;
}

// ─── Auth ──────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; data: { user: any; token: string } }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  register: (email: string, password: string, name: string) =>
    request<{ success: boolean; data: { user: any; token: string } }>("/auth/register", {
      method: "POST",
      body: { email, password, name },
    }),

  getProfile: () =>
    request<{ success: boolean; data: any }>("/auth/me"),
};

// ─── Dashboard ─────────────────────────────────────────

export const dashboardApi = {
  getSummary: () =>
    request<{ success: boolean; data: import("../types").DashboardSummary }>("/dashboard/summary"),

  getCategoryTotals: () =>
    request<{ success: boolean; data: import("../types").CategoryTotal[] }>("/dashboard/category-totals"),

  getTrends: (period: string = "monthly", months: number = 12) =>
    request<{ success: boolean; data: import("../types").TrendData[] }>("/dashboard/trends", {
      params: { period, months },
    }),

  getRecentActivity: (limit: number = 10) =>
    request<{ success: boolean; data: import("../types").RecentActivity }>("/dashboard/recent-activity", {
      params: { limit },
    }),
};

// ─── Records ───────────────────────────────────────────

export const recordsApi = {
  list: (filters: import("../types").RecordFilters = {}) =>
    request<import("../types").PaginatedApiResponse<import("../types").FinancialRecord>>(
      "/records",
      { params: filters as Record<string, string | number | undefined> }
    ),

  getById: (id: string) =>
    request<{ success: boolean; data: import("../types").FinancialRecord }>(`/records/${id}`),

  create: (data: import("../types").CreateRecordData) =>
    request<{ success: boolean; data: import("../types").FinancialRecord }>("/records", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: import("../types").UpdateRecordData) =>
    request<{ success: boolean; data: import("../types").FinancialRecord }>(`/records/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/records/${id}`, {
      method: "DELETE",
    }),
};

// ─── Users ─────────────────────────────────────────────

export const usersApi = {
  list: (page: number = 1, limit: number = 10, search?: string) =>
    request<import("../types").PaginatedApiResponse<import("../types").User>>("/users", {
      params: { page, limit, search },
    }),

  create: (data: { email: string; password: string; name: string; role: string }) =>
    request<{ success: boolean; data: import("../types").User }>("/users", {
      method: "POST",
      body: data,
    }),

  getById: (id: string) =>
    request<{ success: boolean; data: import("../types").User }>(`/users/${id}`),

  update: (id: string, data: { name?: string; email?: string; status?: string }) =>
    request<{ success: boolean; data: import("../types").User }>(`/users/${id}`, {
      method: "PATCH",
      body: data,
    }),

  updateRole: (id: string, role: string) =>
    request<{ success: boolean; data: import("../types").User }>(`/users/${id}/role`, {
      method: "PATCH",
      body: { role },
    }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/users/${id}`, {
      method: "DELETE",
    }),
};
