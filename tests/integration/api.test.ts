import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/config/database";
import bcrypt from "bcryptjs";

// ─── Test Setup ──────────────────────────────────────────

let adminToken: string;
let analystToken: string;
let viewerToken: string;
let adminUserId: string;
let analystUserId: string;
let viewerUserId: string;
let recordId: string;

beforeAll(async () => {
  // Clean up only test-specific users (leaves dev seed data intact)
  const TEST_EMAILS = ["testadmin@test.com", "testanalyst@test.com", "testviewer@test.com"];
  const existingTestUsers = await prisma.user.findMany({
    where: { email: { in: TEST_EMAILS } },
    select: { id: true },
  });
  const existingIds = existingTestUsers.map((u) => u.id);
  if (existingIds.length > 0) {
    await prisma.auditLog.deleteMany({ where: { userId: { in: existingIds } } });
    await prisma.financialRecord.deleteMany({ where: { userId: { in: existingIds } } });
    await prisma.user.deleteMany({ where: { id: { in: existingIds } } });
  }

  // Create test users
  const hash = await bcrypt.hash("Password123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "testadmin@test.com",
      password: hash,
      name: "Test Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  adminUserId = admin.id;

  const analyst = await prisma.user.create({
    data: {
      email: "testanalyst@test.com",
      password: hash,
      name: "Test Analyst",
      role: "ANALYST",
      status: "ACTIVE",
    },
  });
  analystUserId = analyst.id;

  const viewer = await prisma.user.create({
    data: {
      email: "testviewer@test.com",
      password: hash,
      name: "Test Viewer",
      role: "VIEWER",
      status: "ACTIVE",
    },
  });
  viewerUserId = viewer.id;

  // Login all users to get tokens
  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "testadmin@test.com", password: "Password123" });
  adminToken = adminLogin.body.data.token;

  const analystLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "testanalyst@test.com", password: "Password123" });
  analystToken = analystLogin.body.data.token;

  const viewerLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "testviewer@test.com", password: "Password123" });
  viewerToken = viewerLogin.body.data.token;
});

afterAll(async () => {
  // Clean up only test-specific data (leaves dev seed data intact)
  const testIds = [adminUserId, analystUserId, viewerUserId].filter(Boolean);
  if (testIds.length > 0) {
    await prisma.auditLog.deleteMany({ where: { userId: { in: testIds } } });
    await prisma.financialRecord.deleteMany({ where: { userId: { in: testIds } } });
    await prisma.user.deleteMany({ where: { id: { in: testIds } } });
  }
  await prisma.$disconnect();
});

// ═══════════════════════════════════════════════════════════
//  HEALTH CHECK
// ═══════════════════════════════════════════════════════════

describe("GET /health", () => {
  it("should return health status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("running");
  });
});

// ═══════════════════════════════════════════════════════════
//  AUTHENTICATION
// ═══════════════════════════════════════════════════════════

describe("Authentication", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "newuser@test.com",
          password: "NewUser123",
          name: "New User",
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("newuser@test.com");
      expect(res.body.data.user.role).toBe("VIEWER");
      expect(res.body.data.token).toBeDefined();
      // Password should not be returned
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should reject duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "testadmin@test.com",
          password: "Password123",
          name: "Duplicate",
        });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should reject weak password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "weak@test.com",
          password: "weak",
          name: "Weak User",
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "not-email",
          password: "SecurePass123",
          name: "Bad Email",
        });
      expect(res.status).toBe(400);
    });

    it("should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@test.com" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "testadmin@test.com", password: "Password123" });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe("testadmin@test.com");
    });

    it("should reject invalid password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "testadmin@test.com", password: "WrongPass123" });
      expect(res.status).toBe(401);
    });

    it("should reject non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@test.com", password: "Password123" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user profile", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("testadmin@test.com");
      expect(res.body.data.role).toBe("ADMIN");
    });

    it("should reject request without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");
      expect(res.status).toBe(401);
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  FINANCIAL RECORDS
// ═══════════════════════════════════════════════════════════

describe("Financial Records", () => {
  describe("POST /api/records", () => {
    it("should allow admin to create a record", async () => {
      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          date: "2026-03-15",
          description: "March salary",
        });
      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(5000);
      expect(res.body.data.type).toBe("INCOME");
      recordId = res.body.data.id;
    });

    it("should create an expense record", async () => {
      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 1500,
          type: "EXPENSE",
          category: "Rent",
          date: "2026-03-01",
          description: "Monthly rent",
        });
      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe("EXPENSE");
    });

    it("should reject record creation by viewer", async () => {
      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({
          amount: 100,
          type: "INCOME",
          category: "Salary",
          date: "2026-03-15",
        });
      expect(res.status).toBe(403);
    });

    it("should reject record creation by analyst", async () => {
      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${analystToken}`)
        .send({
          amount: 100,
          type: "INCOME",
          category: "Salary",
          date: "2026-03-15",
        });
      expect(res.status).toBe(403);
    });

    it("should reject invalid record data", async () => {
      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: -100,
          type: "INVALID",
          category: "Unknown",
          date: "bad-date",
        });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/records", () => {
    it("should allow analyst to list records", async () => {
      const res = await request(app)
        .get("/api/records")
        .set("Authorization", `Bearer ${analystToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it("should deny viewer from listing records", async () => {
      const res = await request(app)
        .get("/api/records")
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(res.status).toBe(403);
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/records?page=1&limit=1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.limit).toBe(1);
    });

    it("should support type filtering", async () => {
      const res = await request(app)
        .get("/api/records?type=INCOME")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.forEach((record: any) => {
        expect(record.type).toBe("INCOME");
      });
    });

    it("should support search", async () => {
      const res = await request(app)
        .get("/api/records?search=salary")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get("/api/records");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/records/:id", () => {
    it("should get a specific record", async () => {
      const res = await request(app)
        .get(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(recordId);
    });

    it("should return 404 for non-existent record", async () => {
      const res = await request(app)
        .get("/api/records/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it("should reject invalid UUID format", async () => {
      const res = await request(app)
        .get("/api/records/not-a-uuid")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/records/:id", () => {
    it("should allow admin to update a record", async () => {
      const res = await request(app)
        .patch(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ amount: 5500, description: "Updated salary" });
      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(5500);
    });

    it("should reject update by viewer", async () => {
      const res = await request(app)
        .patch(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({ amount: 100 });
      expect(res.status).toBe(403);
    });

    it("should reject empty update", async () => {
      const res = await request(app)
        .patch(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/records/:id", () => {
    it("should reject delete by analyst", async () => {
      const res = await request(app)
        .delete(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${analystToken}`);
      expect(res.status).toBe(403);
    });

    it("should allow admin to soft-delete a record", async () => {
      const res = await request(app)
        .delete(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("soft deleted");
    });

    it("should return 404 for already deleted record", async () => {
      const res = await request(app)
        .delete(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  USER MANAGEMENT
// ═══════════════════════════════════════════════════════════

describe("User Management", () => {
  describe("GET /api/users", () => {
    it("should allow admin to list users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });

    it("should reject list by viewer", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(res.status).toBe(403);
    });

    it("should reject list by analyst", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${analystToken}`);
      expect(res.status).toBe(403);
    });

    it("should support search by name", async () => {
      const res = await request(app)
        .get("/api/users?search=Admin")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should get a specific user", async () => {
      const res = await request(app)
        .get(`/api/users/${viewerUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("testviewer@test.com");
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("should allow admin to update a user", async () => {
      const res = await request(app)
        .patch(`/api/users/${viewerUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated Viewer" });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Updated Viewer");
    });

    it("should reject invalid status value", async () => {
      const res = await request(app)
        .patch(`/api/users/${viewerUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "BANNED" });
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/users/:id/role", () => {
    it("should allow admin to update user role", async () => {
      const res = await request(app)
        .patch(`/api/users/${viewerUserId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "ANALYST" });
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe("ANALYST");
    });

    it("should prevent admin from removing own admin role", async () => {
      const res = await request(app)
        .patch(`/api/users/${adminUserId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "VIEWER" });
      expect(res.status).toBe(400);
    });

    it("should reject invalid role", async () => {
      const res = await request(app)
        .patch(`/api/users/${viewerUserId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "SUPERADMIN" });
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should prevent admin from deleting themselves", async () => {
      const res = await request(app)
        .delete(`/api/users/${adminUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════

describe("Dashboard", () => {
  beforeAll(async () => {
    // Create some fresh records for dashboard tests
    await prisma.financialRecord.createMany({
      data: [
        { amount: 10000, type: "INCOME", category: "Salary", date: new Date("2026-03-15"), userId: adminUserId },
        { amount: 3000, type: "INCOME", category: "Freelance", date: new Date("2026-03-20"), userId: adminUserId },
        { amount: 2000, type: "EXPENSE", category: "Rent", date: new Date("2026-03-01"), userId: adminUserId },
        { amount: 500, type: "EXPENSE", category: "Food", date: new Date("2026-03-05"), userId: adminUserId },
        { amount: 200, type: "EXPENSE", category: "Utilities", date: new Date("2026-03-10"), userId: adminUserId },
      ],
    });
  });

  describe("GET /api/dashboard/summary", () => {
    it("should return financial summary for analyst", async () => {
      const res = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", `Bearer ${analystToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalIncome).toBeDefined();
      expect(res.body.data.totalExpenses).toBeDefined();
      expect(res.body.data.netBalance).toBeDefined();
      expect(res.body.data.totalRecords).toBeDefined();
      expect(typeof res.body.data.totalIncome).toBe("number");
    });

    it("should return financial summary for admin", async () => {
      const res = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.netBalance).toBe(
        res.body.data.totalIncome - res.body.data.totalExpenses
      );
    });

    it("should allow viewer to access summary", async () => {
      const res = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/dashboard/category-totals", () => {
    it("should return category-wise totals", async () => {
      const res = await request(app)
        .get("/api/dashboard/category-totals")
        .set("Authorization", `Bearer ${analystToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty("category");
        expect(res.body.data[0]).toHaveProperty("total");
        expect(res.body.data[0]).toHaveProperty("count");
      }
    });

    it("should allow viewer to access category-totals", async () => {
      const res = await request(app)
        .get("/api/dashboard/category-totals")
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/dashboard/trends", () => {
    it("should return monthly trends", async () => {
      const res = await request(app)
        .get("/api/dashboard/trends?period=monthly")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty("period");
        expect(res.body.data[0]).toHaveProperty("income");
        expect(res.body.data[0]).toHaveProperty("expense");
        expect(res.body.data[0]).toHaveProperty("net");
      }
    });

    it("should return weekly trends", async () => {
      const res = await request(app)
        .get("/api/dashboard/trends?period=weekly&months=3")
        .set("Authorization", `Bearer ${analystToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/dashboard/recent-activity", () => {
    it("should return recent activity for all authenticated users", async () => {
      const res = await request(app)
        .get("/api/dashboard/recent-activity")
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.recentRecords).toBeDefined();
      expect(res.body.data.recentAuditLogs).toBeDefined();
    });

    it("should respect limit parameter", async () => {
      const res = await request(app)
        .get("/api/dashboard/recent-activity?limit=2")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.recentRecords.length).toBeLessThanOrEqual(2);
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  404 HANDLER
// ═══════════════════════════════════════════════════════════

describe("404 Handler", () => {
  it("should return 404 for undefined routes", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
