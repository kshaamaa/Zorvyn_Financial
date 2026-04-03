import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Data Processing & Access Control API",
      version: "1.0.0",
      description:
        "A backend API for managing financial records, user roles, permissions, and dashboard analytics. " +
        "Built with Express.js, TypeScript, Prisma ORM, and SQLite.",
      contact: {
        name: "API Support",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        FinancialRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            amount: { type: "number" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            category: { type: "string" },
            date: { type: "string", format: "date" },
            description: { type: "string" },
            userId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "array", items: {} },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
                totalPages: { type: "integer" },
                hasNext: { type: "boolean" },
                hasPrev: { type: "boolean" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            error: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Authentication", description: "User registration and login" },
      { name: "Users", description: "User management (Admin only)" },
      {
        name: "Financial Records",
        description: "CRUD operations for financial entries",
      },
      {
        name: "Dashboard",
        description: "Summary analytics and trend data",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
