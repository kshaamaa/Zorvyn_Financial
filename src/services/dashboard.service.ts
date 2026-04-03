import prisma from "../config/database";
import { DashboardSummary, CategoryTotal, TrendData } from "../types";

export class DashboardService {
  /**
   * Get overall financial summary
   * Returns total income, total expenses, net balance, and record count
   */
  async getSummary(): Promise<DashboardSummary> {
    const [incomeResult, expenseResult, totalRecords] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: { type: "INCOME", deletedAt: null },
        _sum: { amount: true },
      }),
      prisma.financialRecord.aggregate({
        where: { type: "EXPENSE", deletedAt: null },
        _sum: { amount: true },
      }),
      prisma.financialRecord.count({
        where: { deletedAt: null },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netBalance: Math.round((totalIncome - totalExpenses) * 100) / 100,
      totalRecords,
    };
  }

  /**
   * Get totals grouped by category
   * Returns each category's total amount and record count
   */
  async getCategoryTotals(): Promise<CategoryTotal[]> {
    const results = await prisma.financialRecord.groupBy({
      by: ["category", "type"],
      where: { deletedAt: null },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    return results.map((r: any) => ({
      category: r.category,
      type: r.type,
      total: Math.round((r._sum.amount || 0) * 100) / 100,
      count: r._count.id,
    }));
  }

  /**
   * Get income/expense trends over time
   * Supports monthly and weekly grouping
   */
  async getTrends(
    period: "monthly" | "weekly" = "monthly",
    months: number = 12
  ): Promise<TrendData[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const records = await prisma.financialRecord.findMany({
      where: {
        deletedAt: null,
        date: { gte: startDate },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: "asc" },
    });

    // Group by period
    const grouped = new Map<string, { income: number; expense: number }>();

    for (const record of records) {
      const date = new Date(record.date);
      let key: string;

      if (period === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // Weekly: use ISO week
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split("T")[0];
      }

      if (!grouped.has(key)) {
        grouped.set(key, { income: 0, expense: 0 });
      }

      const entry = grouped.get(key)!;
      if (record.type === "INCOME") {
        entry.income += record.amount;
      } else {
        entry.expense += record.amount;
      }
    }

    // Convert to array
    const trends: TrendData[] = [];
    for (const [period, data] of grouped) {
      trends.push({
        period,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
        net: Math.round((data.income - data.expense) * 100) / 100,
      });
    }

    return trends;
  }

  /**
   * Get recent activity (latest records + audit log entries)
   */
  async getRecentActivity(limit: number = 10) {
    const [recentRecords, recentLogs] = await Promise.all([
      prisma.financialRecord.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          amount: true,
          type: true,
          category: true,
          date: true,
          description: true,
          createdAt: true,
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.auditLog.findMany({
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          createdAt: true,
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    return {
      recentRecords,
      recentAuditLogs: recentLogs,
    };
  }
}

export const dashboardService = new DashboardService();
