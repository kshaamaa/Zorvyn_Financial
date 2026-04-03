import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import { config } from "../config";
import { JwtPayload, Role, AuditAction } from "../types";
import {
  UnauthorizedError,
  ConflictError,
  BadRequestError,
} from "../utils/errors";

const SALT_ROUNDS = 12;

export class AuthService {
  /**
   * Register a new user
   * New users default to VIEWER role
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
  }) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError("An account with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: Role.VIEWER,
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

    // Log the registration
    await prisma.auditLog.create({
      data: {
        action: AuditAction.REGISTER,
        entity: "User",
        entityId: user.id,
        details: JSON.stringify({ email: user.email }),
        userId: user.id,
      },
    });

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return { user, token };
  }

  /**
   * Authenticate user and return JWT token
   */
  async login(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedError(
        "Your account is inactive. Contact an administrator."
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Log the login
    await prisma.auditLog.create({
      data: {
        action: AuditAction.LOGIN,
        entity: "User",
        entityId: user.id,
        details: JSON.stringify({ email: user.email }),
        userId: user.id,
      },
    });

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return user;
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
