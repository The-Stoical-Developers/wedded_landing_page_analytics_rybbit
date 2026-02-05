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
const mockEq = vi.fn();
const mockIn = vi.fn();

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
  vi.resetModules();

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

  describe("getWeddersList", () => {
    const mockWedders = [
      { id: "aaa-111", created_at: "2024-01-15T10:00:00Z", country_code: "ES", provider: "google" },
      { id: "bbb-222", created_at: "2024-01-14T10:00:00Z", country_code: "US", provider: "email" },
      { id: "ccc-333", created_at: "2024-01-13T10:00:00Z", country_code: "ES", provider: "apple" },
    ];

    it("should return paginated wedders list", async () => {
      // Setup chain for getWeddersList
      const mockOrderResult = {
        data: mockWedders,
        error: null,
      };

      mockSelect.mockReturnValue({
        eq: mockEq,
        order: vi.fn().mockReturnValue(mockOrderResult),
      });

      // Mock wedding counts queries
      mockFrom.mockImplementation((table: string) => {
        if (table === "wedders") {
          return { select: mockSelect };
        }
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [{ wedder_1_id: "aaa-111" }, { wedder_1_id: "bbb-222" }],
                error: null,
                not: vi.fn().mockReturnValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getWeddersList({ page: 1, pageSize: 10 });

      expect(result.wedders).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it("should filter by search term (partial ID match)", async () => {
      const mockOrderResult = {
        data: mockWedders,
        error: null,
      };

      mockSelect.mockReturnValue({
        eq: mockEq,
        order: vi.fn().mockReturnValue(mockOrderResult),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "wedders") {
          return { select: mockSelect };
        }
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [],
                error: null,
                not: vi.fn().mockReturnValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getWeddersList({ page: 1, pageSize: 10, search: "aaa" });

      // Should filter in memory to only "aaa-111"
      expect(result.wedders).toHaveLength(1);
      expect(result.wedders[0].id).toBe("aaa-111");
      expect(result.total).toBe(1);
    });

    it("should include country name and provider label", async () => {
      const mockOrderResult = {
        data: [mockWedders[0]], // Just ES/google user
        error: null,
      };

      mockSelect.mockReturnValue({
        eq: mockEq,
        order: vi.fn().mockReturnValue(mockOrderResult),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "wedders") {
          return { select: mockSelect };
        }
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [],
                error: null,
                not: vi.fn().mockReturnValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      const result = await repo.getWeddersList({ page: 1, pageSize: 10 });

      expect(result.wedders[0].countryName).toBe("Spain");
      expect(result.wedders[0].providerLabel).toBe("Google");
    });

    it("should calculate wedding counts correctly", async () => {
      const mockOrderResult = {
        data: [mockWedders[0]], // aaa-111
        error: null,
      };

      mockSelect.mockReturnValue({
        eq: mockEq,
        order: vi.fn().mockReturnValue(mockOrderResult),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "wedders") {
          return { select: mockSelect };
        }
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                // aaa-111 has 2 weddings as wedder_1
                data: [{ wedder_1_id: "aaa-111" }, { wedder_1_id: "aaa-111" }],
                error: null,
                // aaa-111 has 1 wedding as wedder_2
                not: vi.fn().mockReturnValue({
                  data: [{ wedder_2_id: "aaa-111" }],
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

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

      const mockOrderResult = {
        data: manyWedders,
        error: null,
      };

      mockSelect.mockReturnValue({
        eq: mockEq,
        order: vi.fn().mockReturnValue(mockOrderResult),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "wedders") {
          return { select: mockSelect };
        }
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [],
                error: null,
                not: vi.fn().mockReturnValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      // Get page 2 with pageSize 10
      const result = await repo.getWeddersList({ page: 2, pageSize: 10 });

      expect(result.wedders).toHaveLength(10);
      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.wedders[0].id).toBe("user-010"); // Second page starts at index 10
    });

    it("should throw on database error", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq,
        order: vi.fn().mockReturnValue({
          data: null,
          error: new Error("Database error"),
        }),
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      await expect(repo.getWeddersList({ page: 1, pageSize: 10 })).rejects.toThrow("Database error");
    });

    it("should filter by countryCode", async () => {
      const mockOrderResult = {
        data: mockWedders,
        error: null,
      };

      const mockEqChain = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue(mockOrderResult),
      });

      mockSelect.mockReturnValue({
        eq: mockEqChain,
        order: vi.fn().mockReturnValue(mockOrderResult),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "wedders") {
          return { select: mockSelect };
        }
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [],
                error: null,
                not: vi.fn().mockReturnValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

      await repo.getWeddersList({ page: 1, pageSize: 10, countryCode: "ES" });

      // Verify eq was called with country_code filter
      expect(mockEqChain).toHaveBeenCalledWith("country_code", "ES");
    });

    it("should sort by weddingsCount ascending", async () => {
      const weddersWithDifferentCounts = [
        { id: "user-a", created_at: "2024-01-15T10:00:00Z", country_code: "ES", provider: "google" },
        { id: "user-b", created_at: "2024-01-14T10:00:00Z", country_code: "US", provider: "email" },
        { id: "user-c", created_at: "2024-01-13T10:00:00Z", country_code: "ES", provider: "apple" },
      ];

      // Create a thenable mock that works when sortBy !== "createdAt"
      const createThenableMock = (data: unknown[]) => {
        const result = {
          data,
          error: null,
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          then: (resolve: (value: { data: unknown[]; error: null }) => void) => {
            resolve({ data, error: null });
            return Promise.resolve({ data, error: null });
          },
        };
        return result;
      };

      mockSelect.mockReturnValue(createThenableMock(weddersWithDifferentCounts));

      mockFrom.mockImplementation((table: string) => {
        if (table === "wedders") {
          return { select: mockSelect };
        }
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                // user-a: 1, user-b: 3, user-c: 2
                data: [
                  { wedder_1_id: "user-a" },
                  { wedder_1_id: "user-b" },
                  { wedder_1_id: "user-b" },
                  { wedder_1_id: "user-b" },
                  { wedder_1_id: "user-c" },
                  { wedder_1_id: "user-c" },
                ],
                error: null,
                not: vi.fn().mockReturnValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

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

      const createThenableMock = (data: unknown[]) => {
        const result = {
          data,
          error: null,
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          then: (resolve: (value: { data: unknown[]; error: null }) => void) => {
            resolve({ data, error: null });
            return Promise.resolve({ data, error: null });
          },
        };
        return result;
      };

      mockSelect.mockReturnValue(createThenableMock(weddersWithDifferentCounts));

      mockFrom.mockImplementation((table: string) => {
        if (table === "wedders") {
          return { select: mockSelect };
        }
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                // user-a: 1, user-b: 5
                data: [
                  { wedder_1_id: "user-a" },
                  { wedder_1_id: "user-b" },
                  { wedder_1_id: "user-b" },
                  { wedder_1_id: "user-b" },
                  { wedder_1_id: "user-b" },
                  { wedder_1_id: "user-b" },
                ],
                error: null,
                not: vi.fn().mockReturnValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const { SupabaseUserAnalyticsRepository } = await import("./UserAnalyticsRepository.js");
      const repo = new SupabaseUserAnalyticsRepository();

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
