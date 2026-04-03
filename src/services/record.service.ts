import prisma from "../config/database";
import { AuditAction, RecordFilters } from "../types";
import { NotFoundError } from "../utils/errors";

export class RecordService {
  /**
   * Create a new financial record (Admin only)
   */
  async createRecord(
    data: {
      amount: number;
      type: string;
      category: string;
      date: string;
      description?: string;
    },
    userId: string
  ) {
    const record = await prisma.financialRecord.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: new Date(data.date),
        description: data.description || null,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: AuditAction.CREATE,
        entity: "FinancialRecord",
        entityId: record.id,
        details: JSON.stringify({
          amount: data.amount,
          type: data.type,
          category: data.category,
        }),
        userId,
      },
    });

    return record;
  }

  /**
   * Get a single record by ID
   */
  async getRecordById(id: string) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!record) {
      throw new NotFoundError("Financial record");
    }

    return record;
  }

  /**
   * List records with pagination, filtering, search, and sorting
   */
  async listRecords(params: {
    page: number;
    limit: number;
    filters: RecordFilters;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const { page, limit, filters, sortBy = "date", sortOrder = "desc" } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { deletedAt: null };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search } },
        { category: { contains: filters.search } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return { records, total };
  }

  /**
   * Update a financial record (Admin only)
   */
  async updateRecord(
    id: string,
    data: {
      amount?: number;
      type?: string;
      category?: string;
      date?: string;
      description?: string;
    },
    userId: string
  ) {
    const existing = await prisma.financialRecord.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError("Financial record");
    }

    const updateData: any = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type) updateData.type = data.type;
    if (data.category) updateData.category = data.category;
    if (data.date) updateData.date = new Date(data.date);
    if (data.description !== undefined) updateData.description = data.description;

    const record = await prisma.financialRecord.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: "FinancialRecord",
        entityId: id,
        details: JSON.stringify({
          changes: data,
          previousValues: {
            amount: existing.amount,
            type: existing.type,
            category: existing.category,
            date: existing.date,
            description: existing.description,
          },
        }),
        userId,
      },
    });

    return record;
  }

  /**
   * Soft delete a financial record (Admin only)
   */
  async deleteRecord(id: string, userId: string) {
    const existing = await prisma.financialRecord.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError("Financial record");
    }

    await prisma.financialRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: AuditAction.DELETE,
        entity: "FinancialRecord",
        entityId: id,
        details: JSON.stringify({
          amount: existing.amount,
          type: existing.type,
          category: existing.category,
          softDeleted: true,
        }),
        userId,
      },
    });

    return { message: "Financial record has been soft deleted successfully" };
  }
}

export const recordService = new RecordService();
