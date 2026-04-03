import {
  registerSchema,
  loginSchema,
  createRecordSchema,
  updateRecordSchema,
  updateUserSchema,
  updateRoleSchema,
  idParamSchema,
} from "../../src/utils/validators";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should pass with valid data", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "SecurePass123",
        name: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
      const result = registerSchema.safeParse({
        email: "invalid-email",
        password: "SecurePass123",
        name: "John",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with weak password (no uppercase)", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "weakpass123",
        name: "John",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with short password", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "Ab1",
        name: "John",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing name", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "SecurePass123",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with short name", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "SecurePass123",
        name: "J",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should pass with valid credentials", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "anything",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with missing email", () => {
      const result = loginSchema.safeParse({ password: "test" });
      expect(result.success).toBe(false);
    });

    it("should fail with empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createRecordSchema", () => {
    it("should pass with valid income record", () => {
      const result = createRecordSchema.safeParse({
        amount: 5000,
        type: "INCOME",
        category: "Salary",
        date: "2026-04-01",
        description: "Monthly salary",
      });
      expect(result.success).toBe(true);
    });

    it("should pass without optional description", () => {
      const result = createRecordSchema.safeParse({
        amount: 100,
        type: "EXPENSE",
        category: "Food",
        date: "2026-04-01",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with negative amount", () => {
      const result = createRecordSchema.safeParse({
        amount: -100,
        type: "INCOME",
        category: "Salary",
        date: "2026-04-01",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with zero amount", () => {
      const result = createRecordSchema.safeParse({
        amount: 0,
        type: "INCOME",
        category: "Salary",
        date: "2026-04-01",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with invalid type", () => {
      const result = createRecordSchema.safeParse({
        amount: 100,
        type: "TRANSFER",
        category: "Salary",
        date: "2026-04-01",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with invalid category", () => {
      const result = createRecordSchema.safeParse({
        amount: 100,
        type: "INCOME",
        category: "InvalidCategory",
        date: "2026-04-01",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with invalid date format", () => {
      const result = createRecordSchema.safeParse({
        amount: 100,
        type: "INCOME",
        category: "Salary",
        date: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("should fail when amount exceeds maximum", () => {
      const result = createRecordSchema.safeParse({
        amount: 9999999999,
        type: "INCOME",
        category: "Salary",
        date: "2026-04-01",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateRecordSchema", () => {
    it("should pass with partial update", () => {
      const result = updateRecordSchema.safeParse({ amount: 200 });
      expect(result.success).toBe(true);
    });

    it("should fail with empty object", () => {
      const result = updateRecordSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("updateUserSchema", () => {
    it("should pass with valid name update", () => {
      const result = updateUserSchema.safeParse({ name: "New Name" });
      expect(result.success).toBe(true);
    });

    it("should pass with valid status update", () => {
      const result = updateUserSchema.safeParse({ status: "INACTIVE" });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid status", () => {
      const result = updateUserSchema.safeParse({ status: "BANNED" });
      expect(result.success).toBe(false);
    });

    it("should fail with empty object", () => {
      const result = updateUserSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("updateRoleSchema", () => {
    it("should pass with valid role", () => {
      expect(updateRoleSchema.safeParse({ role: "ADMIN" }).success).toBe(true);
      expect(updateRoleSchema.safeParse({ role: "ANALYST" }).success).toBe(true);
      expect(updateRoleSchema.safeParse({ role: "VIEWER" }).success).toBe(true);
    });

    it("should fail with invalid role", () => {
      const result = updateRoleSchema.safeParse({ role: "SUPERADMIN" });
      expect(result.success).toBe(false);
    });
  });

  describe("idParamSchema", () => {
    it("should pass with valid UUID", () => {
      const result = idParamSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid UUID", () => {
      const result = idParamSchema.safeParse({ id: "not-a-uuid" });
      expect(result.success).toBe(false);
    });

    it("should fail with empty string", () => {
      const result = idParamSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
    });
  });
});
