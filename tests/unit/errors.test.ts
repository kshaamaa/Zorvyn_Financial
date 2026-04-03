import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from "../../src/utils/errors";

describe("Custom Error Classes", () => {
  describe("AppError", () => {
    it("should create an error with custom status code", () => {
      const error = new AppError("Custom error", 422);
      expect(error.message).toBe("Custom error");
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it("should default to 500 status code", () => {
      const error = new AppError("Server error");
      expect(error.statusCode).toBe(500);
    });
  });

  describe("NotFoundError", () => {
    it("should create a 404 error with resource name", () => {
      const error = new NotFoundError("User");
      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
    });

    it("should default to 'Resource' if no name given", () => {
      const error = new NotFoundError();
      expect(error.message).toBe("Resource not found");
    });
  });

  describe("UnauthorizedError", () => {
    it("should create a 401 error", () => {
      const error = new UnauthorizedError("Invalid token");
      expect(error.message).toBe("Invalid token");
      expect(error.statusCode).toBe(401);
    });

    it("should have default message", () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe("Unauthorized access");
    });
  });

  describe("ForbiddenError", () => {
    it("should create a 403 error", () => {
      const error = new ForbiddenError("No access");
      expect(error.message).toBe("No access");
      expect(error.statusCode).toBe(403);
    });
  });

  describe("BadRequestError", () => {
    it("should create a 400 error", () => {
      const error = new BadRequestError("Invalid input");
      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
    });
  });

  describe("ConflictError", () => {
    it("should create a 409 error", () => {
      const error = new ConflictError("Email taken");
      expect(error.message).toBe("Email taken");
      expect(error.statusCode).toBe(409);
    });
  });
});
