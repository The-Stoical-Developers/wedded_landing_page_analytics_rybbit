/**
 * Onboarding Analytics Repository Unit Tests
 *
 * Tests funnel, time analysis, and drop-off data aggregation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase module with a fluent chain builder
const createMockChain = (finalResult: any) => {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnValue(finalResult),
  };
  // Make chain methods return themselves or finalResult
  Object.keys(chain).forEach(key => {
    if (key !== 'order') {
      chain[key].mockImplementation(() => {
        // Return final result on last method call
        return { ...chain, ...finalResult };
      });
    }
  });
  return chain;
};

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

describe("SupabaseOnboardingAnalyticsRepository", () => {
  describe("getFunnel", () => {
    it("should calculate funnel stages correctly", async () => {
      // Mock the chain: .select().gte().lte().contains()
      let callCount = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => ({
              contains: vi.fn().mockImplementation(() => {
                callCount++;
                // First call: total sessions
                if (callCount === 1) return { count: 100, data: null, error: null };
                // Phase calls: decreasing counts
                const phaseCounts = [90, 80, 70, 60, 50];
                return { count: phaseCounts[callCount - 2] || 50, data: null, error: null };
              }),
              // For initial total count (no contains)
              data: null,
              error: null,
              count: 100,
            })),
          })),
        })),
      }));

      const { SupabaseOnboardingAnalyticsRepository } = await import("./OnboardingAnalyticsRepository.js");
      const repo = new SupabaseOnboardingAnalyticsRepository();

      const result = await repo.getFunnel(new Date(), new Date());

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return empty funnel when no sessions exist", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => ({
              contains: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
              data: null,
              error: null,
              count: 0,
            })),
          })),
        })),
      }));

      const { SupabaseOnboardingAnalyticsRepository } = await import("./OnboardingAnalyticsRepository.js");
      const repo = new SupabaseOnboardingAnalyticsRepository();

      const result = await repo.getFunnel(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result[0].count).toBe(0);
    });
  });

  describe("getTimeAnalysis", () => {
    it("should calculate time metrics correctly", async () => {
      const completedSessions = [
        { created_at: "2024-01-01T10:00:00Z", completed_at: "2024-01-01T10:02:00Z" },
        { created_at: "2024-01-01T11:00:00Z", completed_at: "2024-01-01T11:03:00Z" },
        { created_at: "2024-01-01T12:00:00Z", completed_at: "2024-01-01T12:01:00Z" },
      ];

      // Phase timing data with multiple answers per phase to trigger duration calculation
      const phaseTimingData = [
        // Wedding w1, PHASE_INFO: 2 answers = 60 seconds
        { wedding_id: "w1", phase: "PHASE_INFO", answered_at: "2024-01-01T10:00:00Z" },
        { wedding_id: "w1", phase: "PHASE_INFO", answered_at: "2024-01-01T10:01:00Z" },
        // Wedding w2, PHASE_INFO: 2 answers = 120 seconds
        { wedding_id: "w2", phase: "PHASE_INFO", answered_at: "2024-01-01T11:00:00Z" },
        { wedding_id: "w2", phase: "PHASE_INFO", answered_at: "2024-01-01T11:02:00Z" },
      ];

      // Mock for completed sessions and phase timing
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({
                data: completedSessions,
                error: null,
              }),
            })),
            is: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockReturnValue({
                  data: phaseTimingData,
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }));

      const { SupabaseOnboardingAnalyticsRepository } = await import("./OnboardingAnalyticsRepository.js");
      const repo = new SupabaseOnboardingAnalyticsRepository();

      const result = await repo.getTimeAnalysis(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.unit).toBe("seconds");
      expect(result.sampleSize).toBe(3);
      expect(result.avgDuration).toBeGreaterThan(0);
      expect(result.medianDuration).toBeGreaterThan(0);
      // Verify byPhase is populated
      expect(result.byPhase).toBeDefined();
      expect(result.byPhase.length).toBeGreaterThan(0);
      // PHASE_INFO should have calculated duration from our mock data
      const phaseInfo = result.byPhase.find((p) => p.phase === "PHASE_INFO");
      expect(phaseInfo).toBeDefined();
      expect(phaseInfo?.sampleSize).toBe(2); // 2 weddings with timing data
    });

    it("should return zeros when no completed onboardings", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({
                data: [],
                error: null,
              }),
            })),
            is: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockReturnValue({
                  data: [],
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }));

      const { SupabaseOnboardingAnalyticsRepository } = await import("./OnboardingAnalyticsRepository.js");
      const repo = new SupabaseOnboardingAnalyticsRepository();

      const result = await repo.getTimeAnalysis(new Date(), new Date());

      expect(result.avgDuration).toBe(0);
      expect(result.medianDuration).toBe(0);
      expect(result.p90Duration).toBe(0);
      expect(result.sampleSize).toBe(0);
    });

    it("should handle null data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({
                data: null,
                error: null,
              }),
            })),
            is: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockReturnValue({
                  data: null,
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }));

      const { SupabaseOnboardingAnalyticsRepository } = await import("./OnboardingAnalyticsRepository.js");
      const repo = new SupabaseOnboardingAnalyticsRepository();

      const result = await repo.getTimeAnalysis(new Date(), new Date());

      expect(result.sampleSize).toBe(0);
    });
  });

  describe("getDropOffs", () => {
    it("should identify top drop-off questions", async () => {
      // Mock multiple calls in sequence
      const mocks = [
        // 1. Total sessions count
        { count: 100, data: null, error: null },
        // 2. Incomplete sessions
        { data: [{ wedding_id: "w1" }, { wedding_id: "w2" }], error: null },
        // 3. All answers for incomplete weddings
        {
          data: [
            { wedding_id: "w1", question_id: "q1", answered_at: "2024-01-01T10:00:00Z" },
            { wedding_id: "w1", question_id: "q2", answered_at: "2024-01-01T10:05:00Z" },
            { wedding_id: "w2", question_id: "q1", answered_at: "2024-01-01T11:00:00Z" },
          ],
          error: null,
        },
      ];

      let callIndex = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => {
          const result = mocks[callIndex] || mocks[mocks.length - 1];
          callIndex++;
          return {
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue(result),
            })),
            is: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockReturnValue(result),
              })),
            })),
            in: vi.fn().mockImplementation(() => ({
              not: vi.fn().mockImplementation(() => ({
                order: vi.fn().mockReturnValue(result),
              })),
            })),
            ...result,
          };
        }),
      }));

      const { SupabaseOnboardingAnalyticsRepository } = await import("./OnboardingAnalyticsRepository.js");
      const repo = new SupabaseOnboardingAnalyticsRepository();

      const result = await repo.getDropOffs(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.totalStarted).toBeDefined();
      expect(result.totalDropOffs).toBeDefined();
      expect(result.topQuestions).toBeDefined();
    });

    it("should return zeros when no drop-offs", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: 100, data: null, error: null }),
          })),
          is: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ data: [], error: null }),
            })),
          })),
          count: 100,
          data: null,
          error: null,
        })),
      }));

      const { SupabaseOnboardingAnalyticsRepository } = await import("./OnboardingAnalyticsRepository.js");
      const repo = new SupabaseOnboardingAnalyticsRepository();

      const result = await repo.getDropOffs(new Date(), new Date());

      expect(result.totalDropOffs).toBe(0);
      expect(result.topQuestions).toEqual([]);
    });

    it("should return empty topQuestions when incomplete sessions have no answers", async () => {
      // This covers the case where there are incomplete sessions but answers array is empty or null
      const mocks = [
        // 1. Total sessions count
        { count: 100, data: null, error: null },
        // 2. Incomplete sessions - there are some
        { data: [{ wedding_id: "w1" }, { wedding_id: "w2" }], error: null },
        // 3. Answers - empty array (no answers for these weddings)
        { data: [], error: null },
      ];

      let callIndex = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => {
          const result = mocks[callIndex] || mocks[mocks.length - 1];
          callIndex++;
          return {
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue(result),
            })),
            is: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockReturnValue(result),
              })),
            })),
            in: vi.fn().mockImplementation(() => ({
              not: vi.fn().mockImplementation(() => ({
                order: vi.fn().mockReturnValue(result),
              })),
            })),
            ...result,
          };
        }),
      }));

      const { SupabaseOnboardingAnalyticsRepository } = await import("./OnboardingAnalyticsRepository.js");
      const repo = new SupabaseOnboardingAnalyticsRepository();

      const result = await repo.getDropOffs(new Date(), new Date());

      expect(result.totalDropOffs).toBe(2);
      expect(result.totalStarted).toBe(100);
      expect(result.topQuestions).toEqual([]);
    });
  });
});
