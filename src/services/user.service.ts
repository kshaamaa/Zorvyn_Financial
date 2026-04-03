import bcrypt from "bcryptjs";
import prisma from "../config/database";
import { Role, AuditAction } from "../types";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../utils/errors";

export class UserService {
  /**
   * Create a new user (Admin only)
   * Allows admin to set email, password, name, and role
   */
  async createUser(
    data: { email: string; password: string; name: string; role: string },
    performedBy: string
  ) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: data.role,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: AuditAction.CREATE,
        entity: "User",
        entityId: user.id,
        details: JSON.stringify({ email: user.email, role: user.role, createdByAdmin: true }),
        userId: performedBy,
      },
    });

    return user;
  }

  /**
   * List all users with pagination (Admin only)
   * Excludes soft-deleted users
   */
  async listUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Get a single user by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { financialRecords: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }

  /**
   * Update user details (Admin only)
   */
  async updateUser(
    id: string,
    data: { name?: string; email?: string; status?: string },
    performedBy: string
  ) {
    // Check user exists
    const existing = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError("User");
    }

    // Check email uniqueness if changing email
    if (data.email && data.email.toLowerCase() !== existing.email) {
      const emailExists = await prisma.user.findFirst({
        where: { email: data.email.toLowerCase(), deletedAt: null, id: { not: id } },
      });
      if (emailExists) {
        throw new ConflictError("Email is already in use by another account");
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.status) updateData.status = data.status;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: "User",
        entityId: id,
        details: JSON.stringify({
          changes: data,
          previousValues: {
            name: existing.name,
            email: existing.email,
            status: existing.status,
          },
        }),
        userId: performedBy,
      },
    });

    return user;
  }

  /**
   * Update user role (Admin only)
   */
  async updateRole(id: string, role: Role, performedBy: string) {
    const existing = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError("User");
    }

    // Prevent admin from removing their own admin role
    if (id === performedBy && role !== Role.ADMIN) {
      throw new BadRequestError("You cannot change your own admin role");
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: "User",
        entityId: id,
        details: JSON.stringify({
          field: "role",
          from: existing.role,
          to: role,
        }),
        userId: performedBy,
      },
    });

    return user;
  }

  /**
   * Soft delete a user (Admin only)
   */
  async deleteUser(id: string, performedBy: string) {
    const existing = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError("User");
    }

    // Prevent self-deletion
    if (id === performedBy) {
      throw new BadRequestError("You cannot delete your own account");
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: AuditAction.DELETE,
        entity: "User",
        entityId: id,
        details: JSON.stringify({ email: existing.email, softDeleted: true }),
        userId: performedBy,
      },
    });

    return { message: "User has been soft deleted successfully" };
  }
}

export const userService = new UserService();
