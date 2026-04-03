import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from "../../src/utils/response";

describe("Response Utilities", () => {
  describe("successResponse", () => {
    it("should return a success response without data", () => {
      const result = successResponse("Operation successful");
      expect(result).toEqual({
        success: true,
        message: "Operation successful",
        data: undefined,
      });
    });

    it("should return a success response with data", () => {
      const data = { id: "1", name: "Test" };
      const result = successResponse("Found", data);
      expect(result).toEqual({
        success: true,
        message: "Found",
        data,
      });
    });
  });

  describe("errorResponse", () => {
    it("should return an error response", () => {
      const result = errorResponse("Something went wrong", "ERR_001");
      expect(result).toEqual({
        success: false,
        message: "Something went wrong",
        error: "ERR_001",
      });
    });

    it("should return an error response without error detail", () => {
      const result = errorResponse("Not found");
      expect(result).toEqual({
        success: false,
        message: "Not found",
        error: undefined,
      });
    });
  });

  describe("paginatedResponse", () => {
    it("should return correct pagination for first page", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = paginatedResponse(data, 25, 1, 10);
      expect(result).toEqual({
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      });
    });

    it("should return correct pagination for last page", () => {
      const data = [{ id: 5 }];
      const result = paginatedResponse(data, 25, 3, 10);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it("should handle empty results", () => {
      const result = paginatedResponse([], 0, 1, 10);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });
  });

  describe("parsePagination", () => {
    it("should return defaults for empty query", () => {
      const result = parsePagination({});
      expect(result).toEqual({ page: 1, limit: 10, skip: 0 });
    });

    it("should parse valid page and limit", () => {
      const result = parsePagination({ page: "3", limit: "20" });
      expect(result).toEqual({ page: 3, limit: 20, skip: 40 });
    });

    it("should enforce minimum page of 1", () => {
      const result = parsePagination({ page: "0" });
      expect(result.page).toBe(1);
    });

    it("should enforce minimum limit of 1", () => {
      const result = parsePagination({ limit: "0" });
      expect(result.limit).toBe(1);
    });

    it("should enforce maximum limit of 100", () => {
      const result = parsePagination({ limit: "500" });
      expect(result.limit).toBe(100);
    });
  });
});
