/**
 * Churn Analytics Repository Unit Tests
 *
 * Tests churn overview, by-stage analysis, and activity metrics.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockAuthAdmin = {
  listUsers: vi.fn(),
};

vi.mock("../../supabase.js", () => ({
  supabase: {
    get client() {
      return {
        from: mockFrom,
        auth: {
          admin: mockAuthAdmin,
        },
      };
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SupabaseChurnAnalyticsRepository", () => {
  describe("getOverview", () => {
    it("should calculate churn overview correctly", async () => {
      // Set up mock chain for multiple queries
      const createSelectChain = (result: any) => ({
        gte: vi.fn().mockImplementation(() => ({
          lte: vi.fn().mockReturnValue(result),
        })),
        not: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue(result),
          })),
        })),
        is: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue(result),
          })),
        })),
        ...result,
      });

      const mockResults = [
        { count: 100, data: null, error: null }, // total wedders
        { count: 70, data: null, error: null },  // completed
        { count: 20, data: null, error: null },  // abandoned
      ];

      let callIndex = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => {
          const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
          callIndex++;
          return createSelectChain(result);
        }),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import("./ChurnAnalyticsRepository.js");
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getOverview(new Date("2024-01-01"), new Date("2024-01-31"));

      expect(result).toBeDefined();
      expect(result.total).toBe(100);
      expect(result.completed).toBe(70);
      expect(result.abandoned).toBe(20);
      expect(result.churnRate).toBeDefined();
    });

    it("should handle empty data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
          })),
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
          is: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
          count: 0,
          data: null,
          error: null,
        })),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import("./ChurnAnalyticsRepository.js");
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.total).toBe(0);
      expect(result.churnRate).toBe(0);
    });

    it("should throw on database error", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ data: null, error: new Error("Database error"), count: null }),
          })),
        })),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import("./ChurnAnalyticsRepository.js");
      const repo = new SupabaseChurnAnalyticsRepository();

      await expect(repo.getOverview(new Date(), new Date())).rejects.toThrow();
    });
  });

  describe("getByStage", () => {
    it("should calculate churn by stage correctly", async () => {
      // Create chain that handles .contains() calls
      let callIndex = 0;
      const phaseCounts = [100, 90, 80, 70, 60, 50];

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => ({
              contains: vi.fn().mockImplementation(() => {
                const count = phaseCounts[callIndex] || 50;
                callIndex++;
                return { count, data: null, error: null };
              }),
              count: 100,
              data: null,
              error: null,
            })),
          })),
          contains: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => {
                const count = phaseCounts[callIndex] || 50;
                callIndex++;
                return { count, data: null, error: null };
              }),
            })),
          })),
          count: 100,
          data: null,
          error: null,
        })),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import("./ChurnAnalyticsRepository.js");
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getByStage(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.stages).toBeDefined();
      expect(result.totalStarted).toBeGreaterThanOrEqual(0);
      expect(result.totalCompleted).toBeGreaterThanOrEqual(0);
    });

    it("should handle all users completed", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => ({
              contains: vi.fn().mockReturnValue({ count: 100, data: null, error: null }),
              count: 100,
              data: null,
              error: null,
            })),
          })),
          contains: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 100, data: null, error: null }),
            })),
          })),
          count: 100,
          data: null,
          error: null,
        })),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import("./ChurnAnalyticsRepository.js");
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getByStage(new Date(), new Date());

      expect(result.overallChurnRate).toBe(0);
    });
  });

  describe("getActivityMetrics", () => {
    it("should calculate activity metrics correctly", async () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            { id: "1", last_sign_in_at: oneWeekAgo.toISOString() }, // Active
            { id: "2", last_sign_in_at: threeMonthsAgo.toISOString() }, // Dormant
            { id: "3", last_sign_in_at: null }, // Never signed in
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import("./ChurnAnalyticsRepository.js");
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivityMetrics();

      expect(result).toBeDefined();
      expect(result.totalUsers).toBe(3);
      expect(result.neverSignedIn).toBe(1);
      expect(result.activeRate).toBeDefined();
      expect(result.dormantRate).toBeDefined();
    });

    it("should handle all active users", async () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday

      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            { id: "1", last_sign_in_at: recentDate.toISOString() },
            { id: "2", last_sign_in_at: recentDate.toISOString() },
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import("./ChurnAnalyticsRepository.js");
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivityMetrics();

      expect(result.totalUsers).toBe(2);
      expect(result.neverSignedIn).toBe(0);
      expect(result.activeUsers).toBe(2);
    });

    it("should handle empty user data", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: { users: [] },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import("./ChurnAnalyticsRepository.js");
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivityMetrics();

      expect(result.totalUsers).toBe(0);
      expect(result.activeRate).toBe(0);
      expect(result.dormantRate).toBe(0);
    });

    it("should throw on auth error", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: null,
        error: new Error("Auth error"),
      });

      const { SupabaseChurnAnalyticsRepository } = await import("./ChurnAnalyticsRepository.js");
      const repo = new SupabaseChurnAnalyticsRepository();

      await expect(repo.getActivityMetrics()).rejects.toThrow("Auth error");
    });
  });
});
