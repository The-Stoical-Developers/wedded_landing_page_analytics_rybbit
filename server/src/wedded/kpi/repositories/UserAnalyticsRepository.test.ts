/**
 * User Analytics Repository Unit Tests
 *
 * Tests data aggregation and transformation logic with mocked queryHelper.
 */

import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the queryHelper module
const mockQuery = vi.fn();
const mockQueryOne = vi.fn();
const mockQueryCount = vi.fn();

vi.mock("./queryHelper.js", () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  queryCount: (...args: unknown[]) => mockQueryCount(...args),
}));

// Import AFTER mock setup
import { PgUserAnalyticsRepository } from "./UserAnalyticsRepository.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PgUserAnalyticsRepository", () => {
  describe("getTotalUsers", () => {
    it("should return total user count", async () => {
      mockQueryCount.mockResolvedValueOnce(1234);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getTotalUsers();

      expect(result).toBe(1234);
      expect(mockQueryCount).toHaveBeenCalledWith("SELECT COUNT(*) FROM public.wedders");
    });

    it("should return 0 when count is zero", async () => {
      mockQueryCount.mockResolvedValueOnce(0);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getTotalUsers();

      expect(result).toBe(0);
    });

    it("should throw on database error", async () => {
      mockQueryCount.mockRejectedValueOnce(new Error("Database error"));

      const repo = new PgUserAnalyticsRepository();

      await expect(repo.getTotalUsers()).rejects.toThrow("Database error");
    });
  });

  describe("getRegistrations", () => {
    it("should aggregate registrations by day", async () => {
      mockQuery.mockResolvedValueOnce([
        { created_at: "2024-01-01T10:00:00Z", country_code: "ES" },
        { created_at: "2024-01-01T14:00:00Z", country_code: "US" },
        { created_at: "2024-01-02T09:00:00Z", country_code: "ES" },
      ]);

      const repo = new PgUserAnalyticsRepository();

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await repo.getRegistrations(startDate, endDate, "day");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: "2024-01-01", count: 2 });
      expect(result[1]).toEqual({ date: "2024-01-02", count: 1 });
    });

    it("should aggregate registrations by week", async () => {
      mockQuery.mockResolvedValueOnce([
        { created_at: "2024-01-01T10:00:00Z", country_code: "ES" }, // Week 1
        { created_at: "2024-01-03T14:00:00Z", country_code: "US" }, // Week 1
        { created_at: "2024-01-08T09:00:00Z", country_code: "ES" }, // Week 2
      ]);

      const repo = new PgUserAnalyticsRepository();

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await repo.getRegistrations(startDate, endDate, "week");

      expect(result).toHaveLength(2);
      // First week of 2024 starts on Monday Jan 1
      expect(result[0].count).toBe(2);
      expect(result[1].count).toBe(1);
    });

    it("should aggregate registrations by month", async () => {
      mockQuery.mockResolvedValueOnce([
        { created_at: "2024-01-15T10:00:00Z", country_code: "ES" },
        { created_at: "2024-01-20T14:00:00Z", country_code: "US" },
        { created_at: "2024-02-05T09:00:00Z", country_code: "ES" },
      ]);

      const repo = new PgUserAnalyticsRepository();

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-02-28");
      const result = await repo.getRegistrations(startDate, endDate, "month");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: "2024-01-01", count: 2 });
      expect(result[1]).toEqual({ date: "2024-02-01", count: 1 });
    });

    it("should return empty array when no data", async () => {
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getRegistrations(new Date(), new Date(), "day");

      expect(result).toEqual([]);
    });
  });

  describe("getGeography", () => {
    it("should calculate percentages correctly", async () => {
      mockQuery.mockResolvedValueOnce([
        { country_code: "ES" },
        { country_code: "ES" },
        { country_code: "ES" },
        { country_code: "US" },
        { country_code: "MX" },
      ]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getGeography(new Date(), new Date());

      expect(result).toHaveLength(3);
      expect(result[0].countryCode).toBe("ES");
      expect(result[0].count).toBe(3);
      expect(result[0].percentage).toBe(60); // 3/5 = 60%
      expect(result[0].countryName).toBe("Spain");
    });

    it("should sort by count descending", async () => {
      mockQuery.mockResolvedValueOnce([
        { country_code: "MX" },
        { country_code: "ES" },
        { country_code: "ES" },
        { country_code: "ES" },
        { country_code: "US" },
        { country_code: "US" },
      ]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getGeography(new Date(), new Date());

      expect(result[0].countryCode).toBe("ES"); // 3 users
      expect(result[1].countryCode).toBe("US"); // 2 users
      expect(result[2].countryCode).toBe("MX"); // 1 user
    });
  });

  describe("getRegistrationsByProvider", () => {
    it("should calculate provider percentages", async () => {
      mockQuery.mockResolvedValueOnce([
        { provider: "google" },
        { provider: "google" },
        { provider: "google" },
        { provider: "email" },
        { provider: null }, // null defaults to email
      ]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getRegistrationsByProvider(new Date(), new Date());

      const google = result.find((r) => r.provider === "google");
      const email = result.find((r) => r.provider === "email");

      expect(google?.count).toBe(3);
      expect(google?.percentage).toBe(60);
      expect(email?.count).toBe(2); // 1 email + 1 null
      expect(email?.percentage).toBe(40);
    });

    it("should include all valid providers even with zero count", async () => {
      mockQuery.mockResolvedValueOnce([{ provider: "google" }]);

      const repo = new PgUserAnalyticsRepository();

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
      // getGrowth calls query() once: all users up to endDate
      mockQuery.mockResolvedValueOnce([
        { created_at: "2023-12-01T00:00:00Z", country_code: "ES" }, // Before start
        { created_at: "2023-12-15T00:00:00Z", country_code: "ES" }, // Before start
        { created_at: "2024-01-01T10:00:00Z", country_code: "ES" }, // In range
        { created_at: "2024-01-02T10:00:00Z", country_code: "US" }, // In range
        { created_at: "2024-01-02T14:00:00Z", country_code: "MX" }, // In range
      ]);

      const repo = new PgUserAnalyticsRepository();

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
      expect(result[1].growthRate).toBeCloseTo(66.67, 1); // 2/3 * 100 ~ 66.67%
    });
  });

  describe("getWeddersList", () => {
    const mockWedders = [
      { id: "aaa-111", created_at: "2024-01-15T10:00:00Z", country_code: "ES", provider: "google" },
      { id: "bbb-222", created_at: "2024-01-14T10:00:00Z", country_code: "US", provider: "email" },
      { id: "ccc-333", created_at: "2024-01-13T10:00:00Z", country_code: "ES", provider: "apple" },
    ];

    it("should return paginated wedders list", async () => {
      // 1st query: wedders
      mockQuery.mockResolvedValueOnce(mockWedders);
      // 2nd query: weddings as wedder_1
      mockQuery.mockResolvedValueOnce([{ wedder_1_id: "aaa-111" }, { wedder_1_id: "bbb-222" }]);
      // 3rd query: weddings as wedder_2
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getWeddersList({ page: 1, pageSize: 10 });

      expect(result.wedders).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it("should filter by search term (partial ID match)", async () => {
      // The repo builds a WHERE clause with ILIKE for search, so DB returns filtered results
      // But the old test returned all 3 and expected in-memory filter to "aaa"
      // In the new repo, search is pushed to the DB query, so we mock the DB returning only the match
      mockQuery.mockResolvedValueOnce([
        { id: "aaa-111", created_at: "2024-01-15T10:00:00Z", country_code: "ES", provider: "google" },
      ]);
      // wedder_1 weddings
      mockQuery.mockResolvedValueOnce([]);
      // wedder_2 weddings
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getWeddersList({ page: 1, pageSize: 10, search: "aaa" });

      expect(result.wedders).toHaveLength(1);
      expect(result.wedders[0].id).toBe("aaa-111");
      expect(result.total).toBe(1);
    });

    it("should include country name and provider label", async () => {
      // Single ES/google user
      mockQuery.mockResolvedValueOnce([mockWedders[0]]);
      // wedder_1 weddings
      mockQuery.mockResolvedValueOnce([]);
      // wedder_2 weddings
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getWeddersList({ page: 1, pageSize: 10 });

      expect(result.wedders[0].countryName).toBe("Spain");
      expect(result.wedders[0].providerLabel).toBe("Google");
    });

    it("should calculate wedding counts correctly", async () => {
      // Single wedder: aaa-111
      mockQuery.mockResolvedValueOnce([mockWedders[0]]);
      // aaa-111 has 2 weddings as wedder_1
      mockQuery.mockResolvedValueOnce([{ wedder_1_id: "aaa-111" }, { wedder_1_id: "aaa-111" }]);
      // aaa-111 has 1 wedding as wedder_2
      mockQuery.mockResolvedValueOnce([{ wedder_2_id: "aaa-111" }]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getWeddersList({ page: 1, pageSize: 10 });

      // 2 as wedder_1 + 1 as wedder_2 = 3 total
      expect(result.wedders[0].weddingsCount).toBe(3);
    });

    it("should handle pagination correctly", async () => {
      const manyWedders = Array.from({ length: 25 }, (_, i) => ({
        id: `user-${i.toString().padStart(3, "0")}`,
        created_at: "2024-01-15T10:00:00Z",
        country_code: "ES",
        provider: "google",
      }));

      // All wedders returned (pagination happens in memory)
      mockQuery.mockResolvedValueOnce(manyWedders);
      // wedder_1 weddings for the 10 wedders on page 2
      mockQuery.mockResolvedValueOnce([]);
      // wedder_2 weddings
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgUserAnalyticsRepository();

      // Get page 2 with pageSize 10
      const result = await repo.getWeddersList({ page: 2, pageSize: 10 });

      expect(result.wedders).toHaveLength(10);
      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.wedders[0].id).toBe("user-010"); // Second page starts at index 10
    });

    it("should throw on database error", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      const repo = new PgUserAnalyticsRepository();

      await expect(repo.getWeddersList({ page: 1, pageSize: 10 })).rejects.toThrow("Database error");
    });

    it("should filter by countryCode", async () => {
      mockQuery.mockResolvedValueOnce(mockWedders);
      // wedder_1 weddings
      mockQuery.mockResolvedValueOnce([]);
      // wedder_2 weddings
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgUserAnalyticsRepository();

      await repo.getWeddersList({ page: 1, pageSize: 10, countryCode: "ES" });

      // Verify the SQL query includes country_code condition
      const firstCallArgs = mockQuery.mock.calls[0];
      expect(firstCallArgs[0]).toContain("country_code");
      expect(firstCallArgs[1]).toContain("ES");
    });

    it("should sort by weddingsCount ascending", async () => {
      const weddersWithDifferentCounts = [
        { id: "user-a", created_at: "2024-01-15T10:00:00Z", country_code: "ES", provider: "google" },
        { id: "user-b", created_at: "2024-01-14T10:00:00Z", country_code: "US", provider: "email" },
        { id: "user-c", created_at: "2024-01-13T10:00:00Z", country_code: "ES", provider: "apple" },
      ];

      // wedders
      mockQuery.mockResolvedValueOnce(weddersWithDifferentCounts);
      // wedder_1 weddings: user-a: 1, user-b: 3, user-c: 2
      mockQuery.mockResolvedValueOnce([
        { wedder_1_id: "user-a" },
        { wedder_1_id: "user-b" },
        { wedder_1_id: "user-b" },
        { wedder_1_id: "user-b" },
        { wedder_1_id: "user-c" },
        { wedder_1_id: "user-c" },
      ]);
      // wedder_2 weddings: none
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getWeddersList({
        page: 1,
        pageSize: 10,
        sortBy: "weddingsCount",
        sortOrder: "asc",
      });

      // Should be sorted: user-a (1), user-c (2), user-b (3)
      expect(result.wedders[0].id).toBe("user-a");
      expect(result.wedders[0].weddingsCount).toBe(1);
      expect(result.wedders[1].id).toBe("user-c");
      expect(result.wedders[1].weddingsCount).toBe(2);
      expect(result.wedders[2].id).toBe("user-b");
      expect(result.wedders[2].weddingsCount).toBe(3);
    });

    it("should sort by weddingsCount descending", async () => {
      const weddersWithDifferentCounts = [
        { id: "user-a", created_at: "2024-01-15T10:00:00Z", country_code: "ES", provider: "google" },
        { id: "user-b", created_at: "2024-01-14T10:00:00Z", country_code: "US", provider: "email" },
      ];

      // wedders
      mockQuery.mockResolvedValueOnce(weddersWithDifferentCounts);
      // wedder_1 weddings: user-a: 1, user-b: 5
      mockQuery.mockResolvedValueOnce([
        { wedder_1_id: "user-a" },
        { wedder_1_id: "user-b" },
        { wedder_1_id: "user-b" },
        { wedder_1_id: "user-b" },
        { wedder_1_id: "user-b" },
        { wedder_1_id: "user-b" },
      ]);
      // wedder_2 weddings: none
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgUserAnalyticsRepository();

      const result = await repo.getWeddersList({
        page: 1,
        pageSize: 10,
        sortBy: "weddingsCount",
        sortOrder: "desc",
      });

      // Should be sorted: user-b (5), user-a (1)
      expect(result.wedders[0].id).toBe("user-b");
      expect(result.wedders[0].weddingsCount).toBe(5);
      expect(result.wedders[1].id).toBe("user-a");
      expect(result.wedders[1].weddingsCount).toBe(1);
    });
  });
});
