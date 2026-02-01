/**
 * User Analytics Repository Unit Tests
 *
 * Tests data aggregation and transformation logic with mocked Supabase client.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase module
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockNot = vi.fn();
const mockOrder = vi.fn();

vi.mock("../../supabase.js", () => ({
  supabase: {
    get client() {
      return {
        from: mockFrom,
      };
    },
  },
}));

// Setup chain mocking
beforeEach(() => {
  vi.clearAllMocks();

  // Default chain setup
  mockFrom.mockReturnValue({
    select: mockSelect,
  });
  mockSelect.mockReturnValue({
    gte: mockGte,
    not: mockNot,
  });
  mockGte.mockReturnValue({
    lte: mockLte,
  });
  mockLte.mockReturnValue({
    data: [],
    error: null,
  });
  mockNot.mockReturnValue({
    gte: mockGte,
  });
  mockOrder.mockReturnValue({
    data: [],
    error: null,
  });
});

describe("SupabaseUserAnalyticsRepository", () => {
  describe("getTotalUsers", () => {
    it("should return total user count", async () => {
      mockSelect.mockReturnValue({
        data: null,
        error: null,
        count: 1234,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getTotalUsers();

      expect(result).toBe(1234);
      expect(mockFrom).toHaveBeenCalledWith("wedders");
      expect(mockSelect).toHaveBeenCalledWith("*", { count: "exact", head: true });
    });

    it("should return 0 when count is null", async () => {
      mockSelect.mockReturnValue({
        data: null,
        error: null,
        count: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getTotalUsers();

      expect(result).toBe(0);
    });

    it("should throw on database error", async () => {
      mockSelect.mockReturnValue({
        data: null,
        error: new Error("Database error"),
        count: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      await expect(repo.getTotalUsers()).rejects.toThrow("Database error");
    });
  });

  describe("getRegistrations", () => {
    it("should aggregate registrations by day", async () => {
      mockLte.mockReturnValue({
        data: [
          { created_at: "2024-01-01T10:00:00Z", country_code: "ES" },
          { created_at: "2024-01-01T14:00:00Z", country_code: "US" },
          { created_at: "2024-01-02T09:00:00Z", country_code: "ES" },
        ],
        error: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await repo.getRegistrations(startDate, endDate, "day");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: "2024-01-01", count: 2 });
      expect(result[1]).toEqual({ date: "2024-01-02", count: 1 });
    });

    it("should aggregate registrations by week", async () => {
      mockLte.mockReturnValue({
        data: [
          { created_at: "2024-01-01T10:00:00Z", country_code: "ES" }, // Week 1
          { created_at: "2024-01-03T14:00:00Z", country_code: "US" }, // Week 1
          { created_at: "2024-01-08T09:00:00Z", country_code: "ES" }, // Week 2
        ],
        error: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await repo.getRegistrations(startDate, endDate, "week");

      expect(result).toHaveLength(2);
      // First week of 2024 starts on Monday Jan 1
      expect(result[0].count).toBe(2);
      expect(result[1].count).toBe(1);
    });

    it("should aggregate registrations by month", async () => {
      mockLte.mockReturnValue({
        data: [
          { created_at: "2024-01-15T10:00:00Z", country_code: "ES" },
          { created_at: "2024-01-20T14:00:00Z", country_code: "US" },
          { created_at: "2024-02-05T09:00:00Z", country_code: "ES" },
        ],
        error: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-02-28");
      const result = await repo.getRegistrations(startDate, endDate, "month");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: "2024-01-01", count: 2 });
      expect(result[1]).toEqual({ date: "2024-02-01", count: 1 });
    });

    it("should return empty array when no data", async () => {
      mockLte.mockReturnValue({
        data: null,
        error: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getRegistrations(new Date(), new Date(), "day");

      expect(result).toEqual([]);
    });
  });

  describe("getGeography", () => {
    it("should calculate percentages correctly", async () => {
      mockLte.mockReturnValue({
        data: [
          { country_code: "ES" },
          { country_code: "ES" },
          { country_code: "ES" },
          { country_code: "US" },
          { country_code: "MX" },
        ],
        error: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getGeography(new Date(), new Date());

      expect(result).toHaveLength(3);
      expect(result[0].countryCode).toBe("ES");
      expect(result[0].count).toBe(3);
      expect(result[0].percentage).toBe(60); // 3/5 = 60%
      expect(result[0].countryName).toBe("Spain");
    });

    it("should sort by count descending", async () => {
      mockLte.mockReturnValue({
        data: [
          { country_code: "MX" },
          { country_code: "ES" },
          { country_code: "ES" },
          { country_code: "ES" },
          { country_code: "US" },
          { country_code: "US" },
        ],
        error: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getGeography(new Date(), new Date());

      expect(result[0].countryCode).toBe("ES"); // 3 users
      expect(result[1].countryCode).toBe("US"); // 2 users
      expect(result[2].countryCode).toBe("MX"); // 1 user
    });
  });

  describe("getRegistrationsByProvider", () => {
    it("should calculate provider percentages", async () => {
      mockLte.mockReturnValue({
        data: [
          { provider: "google" },
          { provider: "google" },
          { provider: "google" },
          { provider: "email" },
          { provider: null }, // null defaults to email
        ],
        error: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getRegistrationsByProvider(new Date(), new Date());

      const google = result.find((r) => r.provider === "google");
      const email = result.find((r) => r.provider === "email");

      expect(google?.count).toBe(3);
      expect(google?.percentage).toBe(60);
      expect(email?.count).toBe(2); // 1 email + 1 null
      expect(email?.percentage).toBe(40);
    });

    it("should include all valid providers even with zero count", async () => {
      mockLte.mockReturnValue({
        data: [{ provider: "google" }],
        error: null,
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getRegistrationsByProvider(new Date(), new Date());

      const providers = result.map((r) => r.provider);
      expect(providers).toContain("google");
      expect(providers).toContain("apple");
      expect(providers).toContain("facebook");
      expect(providers).toContain("email");
    });
  });

  describe("getGrowth", () => {
    it("should calculate growth rate correctly", async () => {
      // Setup mock for getGrowth which uses .order() instead of .gte()
      mockSelect.mockReturnValue({
        lte: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            data: [
              { created_at: "2023-12-01T00:00:00Z", country_code: "ES" }, // Before start
              { created_at: "2023-12-15T00:00:00Z", country_code: "ES" }, // Before start
              { created_at: "2024-01-01T10:00:00Z", country_code: "ES" }, // In range
              { created_at: "2024-01-02T10:00:00Z", country_code: "US" }, // In range
              { created_at: "2024-01-02T14:00:00Z", country_code: "MX" }, // In range
            ],
            error: null,
          }),
        }),
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await repo.getGrowth(startDate, endDate);

      expect(result).toHaveLength(2);
      // Day 1: baseline 2 users, new 1 user, total 3
      expect(result[0].totalUsers).toBe(3);
      expect(result[0].newUsers).toBe(1);
      expect(result[0].growthRate).toBe(50); // 1/2 * 100 = 50%

      // Day 2: baseline 3 users, new 2 users, total 5
      expect(result[1].totalUsers).toBe(5);
      expect(result[1].newUsers).toBe(2);
      expect(result[1].growthRate).toBeCloseTo(66.67, 1); // 2/3 * 100 ≈ 66.67%
    });
  });
});
