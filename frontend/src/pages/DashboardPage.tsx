import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { dashboardApi } from "../lib/api";
import { formatCurrency, formatDate, CATEGORY_COLORS } from "../lib/utils";
import type { DashboardSummary, CategoryTotal, TrendData, RecentActivity } from "../types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  Activity,
  RefreshCw,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "../lib/utils";

// ─── Summary Card ───────────────────────────────────────

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: "blue" | "green" | "red" | "purple";
  trend?: string;
  trendUp?: boolean;
}

function SummaryCard({ title, value, icon: Icon, color, trend, trendUp }: SummaryCardProps) {
  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", text: "text-blue-900" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600", text: "text-emerald-900" },
    red: { bg: "bg-red-50", icon: "text-red-600", text: "text-red-900" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", text: "text-purple-900" },
  };
  const c = colorMap[color];

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={cn("text-2xl font-bold truncate", c.text)}>{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trendUp !== undefined &&
                (trendUp ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                ))}
              <span className="text-xs text-gray-500">{trend}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl shrink-0", c.bg)}>
          <Icon className={cn("w-6 h-6", c.icon)} />
        </div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-500 capitalize">{entry.name}:</span>
          <span className="font-medium text-gray-900">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard Page ────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<"monthly" | "weekly">("monthly");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (period = trendPeriod) => {
    try {
      const [summaryRes, categoriesRes, trendsRes, activityRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getCategoryTotals(),
        dashboardApi.getTrends(period, 12),
        dashboardApi.getRecentActivity(8),
      ]);
      setSummary(summaryRes.data!);
      setCategoryTotals(categoriesRes.data!);
      setTrends(trendsRes.data!);
      setActivity(activityRes.data!);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(trendPeriod);
  };

  const handlePeriodChange = async (period: "monthly" | "weekly") => {
    setTrendPeriod(period);
    setRefreshing(true);
    await fetchData(period);
  };

  // Prepare pie chart data for categories (top 8 by income)
  const incomeCategories = categoryTotals
    .filter((c) => c.type === "INCOME")
    .slice(0, 8);
  const expenseCategories = categoryTotals
    .filter((c) => c.type === "EXPENSE")
    .slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">{error}</p>
          <button onClick={handleRefresh} className="btn-primary mt-4">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your financial snapshot at a glance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary btn-sm gap-2"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={formatCurrency(summary?.totalIncome || 0)}
          icon={TrendingUp}
          color="green"
          trend="All time"
          trendUp={true}
        />
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(summary?.totalExpenses || 0)}
          icon={TrendingDown}
          color="red"
          trend="All time"
          trendUp={false}
        />
        <SummaryCard
          title="Net Balance"
          value={formatCurrency(summary?.netBalance || 0)}
          icon={DollarSign}
          color={(summary?.netBalance || 0) >= 0 ? "blue" : "red"}
          trend={(summary?.netBalance || 0) >= 0 ? "Positive" : "Negative"}
          trendUp={(summary?.netBalance || 0) >= 0}
        />
        <SummaryCard
          title="Total Records"
          value={(summary?.totalRecords || 0).toLocaleString()}
          icon={BarChart2}
          color="purple"
          trend="Financial entries"
        />
      </div>

      {/* Trend Chart */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Income vs Expenses</h2>
            <p className="text-xs text-gray-500 mt-0.5">12-month rolling trend</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {(["monthly", "weekly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  trendPeriod === p
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trends} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#incomeGrad)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#expenseGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Category Bar Chart */}
        <div className="card p-6 lg:col-span-3">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Expenses by Category</h2>
            <p className="text-xs text-gray-500 mt-0.5">Top categories by spend</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={expenseCategories.slice(0, 6)}
              margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
                      <p className="font-medium">{payload[0].payload.category}</p>
                      <p className="text-gray-500 mt-1">
                        {formatCurrency(payload[0].value as number)} • {payload[0].payload.count} records
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {expenseCategories.slice(0, 6).map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={CATEGORY_COLORS[entry.category] || "#6b7280"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income Pie Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Income Sources</h2>
            <p className="text-xs text-gray-500 mt-0.5">Distribution by category</p>
          </div>
          {incomeCategories.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No income data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={incomeCategories}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                >
                  {incomeCategories.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
                        <p className="font-medium">{payload[0].name}</p>
                        <p className="text-gray-500">{formatCurrency(payload[0].value as number)}</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(activity?.recentRecords || []).length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              No recent transactions
            </div>
          ) : (
            activity?.recentRecords.map((record) => (
              <div
                key={record.id}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      record.type === "INCOME"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    )}
                  >
                    {record.type === "INCOME" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {record.description || record.category}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded font-medium",
                          record.type === "INCOME"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        )}
                      >
                        {record.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.date)}
                      </div>
                      {record.user?.name && (
                        <span className="text-xs text-gray-400">• {record.user.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold shrink-0 ml-4",
                    record.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {record.type === "INCOME" ? "+" : "-"}{formatCurrency(record.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
