/**
 * Wedding Analytics Repository Unit Tests
 *
 * Tests wedding overview and engagement metrics aggregation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();

vi.mock("../../supabase.js", () => ({
  supabase: {
    get client() {
      return {
        from: mockFrom,
      };
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SupabaseWeddingAnalyticsRepository", () => {
  describe("getOverview", () => {
    it("should calculate wedding overview correctly", async () => {
      // Mock results for each query in sequence
      const mockResults = [
        { count: 100, data: null, error: null }, // total weddings
        { count: 80, data: null, error: null },  // active weddings
        { count: 60, data: null, error: null },  // with partner
        { count: 50, data: null, error: null },  // with date set
      ];

      let callIndex = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => {
              const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
              callIndex++;
              return result;
            }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => {
                const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                callIndex++;
                return result;
              }),
            })),
          })),
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => {
                const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                callIndex++;
                return result;
              }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.totalWeddings).toBe(100);
      expect(result.activeWeddings).toBe(80);
      expect(result.archivedWeddings).toBe(20); // 100 - 80
      expect(result.withPartner).toBe(60);
      expect(result.soloPlanning).toBe(40); // 100 - 60
      expect(result.withDateSet).toBe(50);
      expect(result.withoutDate).toBe(50); // 100 - 50
      expect(result.partnerJoinRate).toBe(60); // 60/100 * 100
      expect(result.dateSetRate).toBe(50); // 50/100 * 100
    });

    it("should handle empty weddings data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.totalWeddings).toBe(0);
      expect(result.activeWeddings).toBe(0);
      expect(result.partnerJoinRate).toBe(0);
      expect(result.dateSetRate).toBe(0);
    });

    it("should handle null data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: null, data: null, error: null }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: null, data: null, error: null }),
            })),
          })),
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: null, data: null, error: null }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.totalWeddings).toBe(0);
    });

    it("should throw on database error", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: null, data: null, error: new Error("Database error") }),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      await expect(repo.getOverview(new Date(), new Date())).rejects.toThrow("Database error");
    });
  });

  describe("getEngagement", () => {
    it("should calculate engagement metrics correctly", async () => {
      // Mock results for each query in sequence
      // Order: weddings, tasks total, tasks completed, vendors total, saved, contacted, hired
      const mockResults = [
        { count: 100, data: null, error: null }, // weddings
        { count: 500, data: null, error: null }, // total tasks
        { count: 300, data: null, error: null }, // completed tasks
        { count: 200, data: null, error: null }, // total vendors
        { count: 100, data: null, error: null }, // saved vendors
        { count: 60, data: null, error: null },  // contacted vendors
        { count: 40, data: null, error: null },  // hired vendors
      ];

      let callIndex = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => {
              const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
              callIndex++;
              return result;
            }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => {
                const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                callIndex++;
                return result;
              }),
            })),
            is: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => {
                  const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                  callIndex++;
                  return result;
                }),
              })),
            })),
          })),
          is: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => {
                const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                callIndex++;
                return result;
              }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getEngagement(new Date(), new Date());

      expect(result.tasks.totalTasks).toBe(500);
      expect(result.tasks.completedTasks).toBe(300);
      expect(result.tasks.taskCompletionRate).toBe(60); // 300/500 * 100
      expect(result.vendors.totalVendors).toBe(200);
      expect(result.vendors.hiredVendors).toBe(40);
      expect(result.vendors.conversionRate).toBe(20); // 40/200 * 100
      expect(result.avgTasksPerWedding).toBe(5); // 500/100
      expect(result.avgVendorsPerWedding).toBe(2); // 200/100
    });

    it("should handle no weddings", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
            is: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
              })),
            })),
          })),
          is: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getEngagement(new Date(), new Date());

      expect(result.tasks.totalTasks).toBe(0);
      expect(result.tasks.taskCompletionRate).toBe(0);
      expect(result.avgTasksPerWedding).toBe(0);
      expect(result.avgVendorsPerWedding).toBe(0);
    });

    it("should calculate vendor conversion rate", async () => {
      // Specific test for vendor conversion
      const mockResults = [
        { count: 50, data: null, error: null },  // weddings
        { count: 100, data: null, error: null }, // total tasks
        { count: 50, data: null, error: null },  // completed tasks
        { count: 100, data: null, error: null }, // total vendors
        { count: 40, data: null, error: null },  // saved vendors
        { count: 35, data: null, error: null },  // contacted vendors
        { count: 25, data: null, error: null },  // hired vendors
      ];

      let callIndex = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => {
              const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
              callIndex++;
              return result;
            }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => {
                const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                callIndex++;
                return result;
              }),
            })),
            is: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => {
                  const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                  callIndex++;
                  return result;
                }),
              })),
            })),
          })),
          is: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => {
                const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                callIndex++;
                return result;
              }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getEngagement(new Date(), new Date());

      expect(result.vendors.totalVendors).toBe(100);
      expect(result.vendors.savedVendors).toBe(40);
      expect(result.vendors.contactedVendors).toBe(35);
      expect(result.vendors.hiredVendors).toBe(25);
      expect(result.vendors.conversionRate).toBe(25); // 25/100 * 100
    });
  });
});
