/**
 * Journey Analytics Repository Unit Tests
 *
 * Tests journey funnel, milestones, and timeline data aggregation.
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

describe("SupabaseJourneyAnalyticsRepository", () => {
  describe("getFunnel", () => {
    it("should calculate journey funnel correctly", async () => {
      // Setup mock for multiple table queries
      const mockResults: Record<string, any> = {
        wedders: { data: [{ id: "u1", created_at: "2024-01-01" }, { id: "u2", created_at: "2024-01-02" }], error: null },
        weddings: { data: [{ id: "w1", wedder_1_id: "u1", created_at: "2024-01-01" }], error: null },
        onboarding_sessions: { data: [{ wedding_id: "w1", completed_phases: ["PHASE_CELEBRATION"], completed_at: "2024-01-01" }], error: null },
        wedder_answers: { data: [{ wedding_id: "w1" }], error: null },
        missions: { data: [], error: null },
      };

      mockFrom.mockImplementation((tableName: string) => {
        const result = mockResults[tableName] || { data: [], error: null };
        return {
          select: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue(result),
            })),
            in: vi.fn().mockImplementation(() => ({
              ...result,
              in: vi.fn().mockReturnValue(result),
            })),
            eq: vi.fn().mockImplementation(() => ({
              in: vi.fn().mockImplementation(() => ({
                in: vi.fn().mockReturnValue(result),
              })),
            })),
            ...result,
          })),
        };
      });

      const { SupabaseJourneyAnalyticsRepository } = await import("./JourneyAnalyticsRepository.js");
      const repo = new SupabaseJourneyAnalyticsRepository();

      const result = await repo.getFunnel(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.stages).toBeDefined();
      expect(result.totalUsers).toBeGreaterThanOrEqual(0);
      expect(result.overallCompletionRate).toBeDefined();
    });

    it("should handle zero registrations", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ data: [], error: null }),
          })),
          in: vi.fn().mockReturnValue({ data: [], error: null }),
        })),
      }));

      const { SupabaseJourneyAnalyticsRepository } = await import("./JourneyAnalyticsRepository.js");
      const repo = new SupabaseJourneyAnalyticsRepository();

      const result = await repo.getFunnel(new Date(), new Date());

      expect(result.totalUsers).toBe(0);
      expect(result.overallCompletionRate).toBe(0);
    });

    it("should throw on database error", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ data: null, error: new Error("Query failed") }),
          })),
        })),
      }));

      const { SupabaseJourneyAnalyticsRepository } = await import("./JourneyAnalyticsRepository.js");
      const repo = new SupabaseJourneyAnalyticsRepository();

      await expect(repo.getFunnel(new Date(), new Date())).rejects.toThrow("Query failed");
    });
  });

  describe("getMilestones", () => {
    it("should calculate milestone achievements", async () => {
      mockFrom.mockImplementation((tableName: string) => {
        if (tableName === "weddings") {
          return {
            select: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockReturnValue({ count: 100, data: null, error: null }),
              })),
              count: 100,
              data: null,
              error: null,
            })),
          };
        }
        // missions table
        return {
          select: vi.fn().mockImplementation(() => ({
            in: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockReturnValue({
                  data: [
                    { template_id: "CEREMONY_VENUE", wedding_id: "w1", created_at: "2024-01-01", updated_at: "2024-01-05", status: "COMPLETED" },
                    { template_id: "CELEBRATION_VENUE", wedding_id: "w2", created_at: "2024-01-02", updated_at: "2024-01-08", status: "COMPLETED" },
                  ],
                  error: null,
                }),
              })),
            })),
          })),
        };
      });

      const { SupabaseJourneyAnalyticsRepository } = await import("./JourneyAnalyticsRepository.js");
      const repo = new SupabaseJourneyAnalyticsRepository();

      const result = await repo.getMilestones(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.milestones).toBeDefined();
      expect(result.milestones.length).toBe(3);
      expect(result.totalWeddings).toBe(100);
    });

    it("should handle no weddings", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
          })),
          in: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ data: [], error: null }),
            })),
          })),
          count: 0,
          data: null,
          error: null,
        })),
      }));

      const { SupabaseJourneyAnalyticsRepository } = await import("./JourneyAnalyticsRepository.js");
      const repo = new SupabaseJourneyAnalyticsRepository();

      const result = await repo.getMilestones(new Date(), new Date());

      expect(result.totalWeddings).toBe(0);
      expect(result.milestones).toBeDefined();
    });
  });

  describe("getTimeline", () => {
    it("should aggregate timeline data by day", async () => {
      const mockTableResults: Record<string, any> = {
        wedders: {
          data: [
            { created_at: "2024-01-01T10:00:00Z" },
            { created_at: "2024-01-01T14:00:00Z" },
            { created_at: "2024-01-02T09:00:00Z" },
          ],
          error: null,
        },
        weddings: {
          data: [
            { created_at: "2024-01-01T11:00:00Z" },
            { created_at: "2024-01-02T10:00:00Z" },
          ],
          error: null,
        },
        onboarding_sessions: {
          data: [{ completed_at: "2024-01-01T12:00:00Z" }],
          error: null,
        },
        wedder_answers: {
          data: [{ answered_at: "2024-01-01T13:00:00Z" }],
          error: null,
        },
      };

      mockFrom.mockImplementation((tableName: string) => {
        const result = mockTableResults[tableName] || { data: [], error: null };
        return {
          select: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => ({
                order: vi.fn().mockReturnValue(result),
              })),
            })),
            not: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => ({
                  order: vi.fn().mockReturnValue(result),
                })),
              })),
            })),
            in: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => ({
                  order: vi.fn().mockReturnValue(result),
                })),
              })),
            })),
          })),
        };
      });

      const { SupabaseJourneyAnalyticsRepository } = await import("./JourneyAnalyticsRepository.js");
      const repo = new SupabaseJourneyAnalyticsRepository();

      const result = await repo.getTimeline(new Date("2024-01-01"), new Date("2024-01-31"));

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.totals).toBeDefined();
      expect(result.totals.registrations).toBe(3);
      expect(result.totals.weddingsCreated).toBe(2);
    });

    it("should handle empty timeline data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => ({
              order: vi.fn().mockReturnValue({ data: [], error: null }),
            })),
          })),
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => ({
                order: vi.fn().mockReturnValue({ data: [], error: null }),
              })),
            })),
          })),
          in: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => ({
                order: vi.fn().mockReturnValue({ data: [], error: null }),
              })),
            })),
          })),
        })),
      }));

      const { SupabaseJourneyAnalyticsRepository } = await import("./JourneyAnalyticsRepository.js");
      const repo = new SupabaseJourneyAnalyticsRepository();

      const result = await repo.getTimeline(new Date(), new Date());

      expect(result.totals.registrations).toBe(0);
      expect(result.totals.weddingsCreated).toBe(0);
      expect(result.totals.onboardingCompleted).toBe(0);
      expect(result.totals.tutorialCompleted).toBe(0);
    });
  });
});
