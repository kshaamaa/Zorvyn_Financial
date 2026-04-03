import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Rent",
  "Food",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Transportation",
  "Education",
  "Shopping",
  "Insurance",
  "Tax",
  "Other",
];

export const CATEGORY_COLORS: Record<string, string> = {
  Salary: "#3b82f6",
  Freelance: "#8b5cf6",
  Investments: "#10b981",
  Rent: "#f59e0b",
  Food: "#ef4444",
  Utilities: "#06b6d4",
  Entertainment: "#ec4899",
  Healthcare: "#14b8a6",
  Transportation: "#f97316",
  Education: "#6366f1",
  Shopping: "#84cc16",
  Insurance: "#a855f7",
  Tax: "#dc2626",
  Other: "#6b7280",
};
