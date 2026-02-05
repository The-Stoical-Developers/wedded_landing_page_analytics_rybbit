/**
 * Churn Analytics Repository Unit Tests
 *
 * Comprehensive tests for new activity-based churn definition:
 * - Activity metrics: active, at-risk, churned recent, churned dormant, never logged
 * - Breakdown by journey stage
 * - Time metrics
 * - Legacy methods for backwards compatibility
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

// Helper to create mock user with activity
function createMockUser(
  id: string,
  daysAgo: number | null,
  createdDaysAgo: number = 60
) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  return {
    id,
    created_at: new Date(now - createdDaysAgo * oneDay).toISOString(),
    last_sign_in_at:
      daysAgo !== null
        ? new Date(now - daysAgo * oneDay).toISOString()
        : null,
  };
}

describe("SupabaseChurnAnalyticsRepository", () => {
  describe("getActivity", () => {
    it("should categorize users into activity buckets correctly", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            createMockUser("active1", 1), // Active (1 day)
            createMockUser("active2", 5), // Active (5 days)
            createMockUser("atRisk1", 10), // At Risk (10 days)
            createMockUser("atRisk2", 13), // At Risk (13 days)
            createMockUser("churnedRecent1", 20), // Churned Recent (20 days)
            createMockUser("churnedRecent2", 25), // Churned Recent (25 days)
            createMockUser("churnedDormant1", 40), // Churned Dormant (40 days)
            createMockUser("churnedDormant2", 100), // Churned Dormant (100 days)
            createMockUser("neverLogged1", null), // Never Logged
            createMockUser("neverLogged2", null), // Never Logged
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.totalUsers).toBe(10);
      expect(result.active).toBe(2);
      expect(result.atRisk).toBe(2);
      expect(result.churnedRecent).toBe(2);
      expect(result.churnedDormant).toBe(2);
      expect(result.neverLogged).toBe(2);
      expect(result.activeRate).toBe(20);
      expect(result.atRiskRate).toBe(20);
      expect(result.churnRate).toBe(40); // (2 + 2) / 10 * 100 = 40%
      expect(result.churnedRecentRate).toBe(20);
      expect(result.churnedDormantRate).toBe(20);
      expect(result.neverLoggedRate).toBe(20);
    });

    it("should handle edge case at exactly 7 days (still active)", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [createMockUser("edge", 7)],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.active).toBe(1);
      expect(result.atRisk).toBe(0);
    });

    it("should handle edge case at exactly 14 days (at risk, not churned)", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [createMockUser("edge", 14)],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.atRisk).toBe(1);
      expect(result.churnedRecent).toBe(0);
    });

    it("should handle edge case at exactly 30 days (churned recent)", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [createMockUser("edge", 30)],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.churnedRecent).toBe(1);
      expect(result.churnedDormant).toBe(0);
    });

    it("should handle empty user list", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: { users: [] },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.totalUsers).toBe(0);
      expect(result.active).toBe(0);
      expect(result.churnRate).toBe(0);
      expect(result.activeRate).toBe(0);
    });

    it("should handle all users being active", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            createMockUser("u1", 1),
            createMockUser("u2", 2),
            createMockUser("u3", 3),
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.active).toBe(3);
      expect(result.activeRate).toBe(100);
      expect(result.churnRate).toBe(0);
    });

    it("should handle all users being churned", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [createMockUser("u1", 20), createMockUser("u2", 50)],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.active).toBe(0);
      expect(result.churnRate).toBe(100);
    });

    it("should handle pagination when fetching users", async () => {
      // First call returns 100 users, second call returns 50 users
      const firstPageUsers = Array.from({ length: 100 }, (_, i) =>
        createMockUser(`user${i}`, 1)
      );
      const secondPageUsers = Array.from({ length: 50 }, (_, i) =>
        createMockUser(`user${i + 100}`, 1)
      );

      mockAuthAdmin.listUsers
        .mockResolvedValueOnce({
          data: { users: firstPageUsers },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { users: secondPageUsers },
          error: null,
        });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.totalUsers).toBe(150);
      expect(mockAuthAdmin.listUsers).toHaveBeenCalledTimes(2);
    });

    it("should throw on auth error", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: null,
        error: new Error("Auth service unavailable"),
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      await expect(repo.getActivity()).rejects.toThrow(
        "Auth service unavailable"
      );
    });
  });

  describe("getBreakdown", () => {
    it("should return empty breakdown when no churned users", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [createMockUser("active", 1)], // Only active user
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getBreakdown();

      expect(result.totalChurned).toBe(0);
      expect(result.neverCreatedWedding).toBe(0);
      expect(result.onboardingPhaseInfo).toBe(0);
      expect(result.postOnboarding).toBe(0);
      expect(result.postTutorial).toBe(0);
    });

    it("should categorize churned users who never created a wedding", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [createMockUser("churned1", 20)],
        },
        error: null,
      });

      // Mock weddings query - no weddings
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({ data: [], error: null }),
        }),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getBreakdown();

      expect(result.totalChurned).toBe(1);
      expect(result.neverCreatedWedding).toBe(1);
      expect(result.neverCreatedWeddingRate).toBe(100);
    });

    it("should categorize churned users in onboarding phases", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            createMockUser("churned1", 20), // Has wedding, no onboarding
            createMockUser("churned2", 20), // Has wedding, phase info only
            createMockUser("churned3", 20), // Has wedding, phase engagement
          ],
        },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [
                  { id: "w1", wedder_1_id: "churned1" },
                  { id: "w2", wedder_1_id: "churned2" },
                  { id: "w3", wedder_1_id: "churned3" },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === "onboarding_sessions") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [
                  {
                    wedding_id: "w2",
                    completed_phases: ["PHASE_INFO"],
                    completed_at: null,
                  },
                  {
                    wedding_id: "w3",
                    completed_phases: ["PHASE_INFO", "PHASE_ENGAGEMENT"],
                    completed_at: null,
                  },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === "wedder_answers") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getBreakdown();

      expect(result.totalChurned).toBe(3);
      expect(result.neverCreatedWedding).toBe(0);
      expect(result.onboardingPhaseInfo).toBe(1); // w1 has no onboarding session
      expect(result.onboardingPhaseEngagement).toBe(1); // w2 stuck at engagement
      expect(result.onboardingPhaseCeremony).toBe(1); // w3 stuck at ceremony
    });

    it("should categorize post-onboarding and post-tutorial churned users", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            createMockUser("churned1", 20), // Completed onboarding, no tutorial
            createMockUser("churned2", 20), // Completed onboarding + tutorial
          ],
        },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [
                  { id: "w1", wedder_1_id: "churned1" },
                  { id: "w2", wedder_1_id: "churned2" },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === "onboarding_sessions") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [
                  {
                    wedding_id: "w1",
                    completed_phases: [
                      "PHASE_INFO",
                      "PHASE_ENGAGEMENT",
                      "PHASE_CEREMONY",
                      "PHASE_CELEBRATION",
                      "PHASE_GUESTS",
                    ],
                    completed_at: "2024-01-20",
                  },
                  {
                    wedding_id: "w2",
                    completed_phases: [
                      "PHASE_INFO",
                      "PHASE_ENGAGEMENT",
                      "PHASE_CEREMONY",
                      "PHASE_CELEBRATION",
                      "PHASE_GUESTS",
                    ],
                    completed_at: "2024-01-20",
                  },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === "wedder_answers") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  data: [{ wedding_id: "w2" }], // Only w2 has tutorial answers
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getBreakdown();

      expect(result.totalChurned).toBe(2);
      expect(result.postOnboarding).toBe(1);
      expect(result.postTutorial).toBe(1);
      expect(result.postOnboardingRate).toBe(50);
      expect(result.postTutorialRate).toBe(50);
    });

    it("should handle all onboarding phases correctly", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            createMockUser("u1", 20), // Stuck at Phase Info
            createMockUser("u2", 20), // Stuck at Phase Engagement
            createMockUser("u3", 20), // Stuck at Phase Ceremony
            createMockUser("u4", 20), // Stuck at Phase Celebration
            createMockUser("u5", 20), // Stuck at Phase Guests
          ],
        },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [
                  { id: "w1", wedder_1_id: "u1" },
                  { id: "w2", wedder_1_id: "u2" },
                  { id: "w3", wedder_1_id: "u3" },
                  { id: "w4", wedder_1_id: "u4" },
                  { id: "w5", wedder_1_id: "u5" },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === "onboarding_sessions") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [
                  { wedding_id: "w1", completed_phases: [], completed_at: null },
                  {
                    wedding_id: "w2",
                    completed_phases: ["PHASE_INFO"],
                    completed_at: null,
                  },
                  {
                    wedding_id: "w3",
                    completed_phases: ["PHASE_INFO", "PHASE_ENGAGEMENT"],
                    completed_at: null,
                  },
                  {
                    wedding_id: "w4",
                    completed_phases: [
                      "PHASE_INFO",
                      "PHASE_ENGAGEMENT",
                      "PHASE_CEREMONY",
                    ],
                    completed_at: null,
                  },
                  {
                    wedding_id: "w5",
                    completed_phases: [
                      "PHASE_INFO",
                      "PHASE_ENGAGEMENT",
                      "PHASE_CEREMONY",
                      "PHASE_CELEBRATION",
                    ],
                    completed_at: null,
                  },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === "wedder_answers") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getBreakdown();

      expect(result.totalChurned).toBe(5);
      expect(result.onboardingPhaseInfo).toBe(1);
      expect(result.onboardingPhaseEngagement).toBe(1);
      expect(result.onboardingPhaseCeremony).toBe(1);
      expect(result.onboardingPhaseCelebration).toBe(1);
      expect(result.onboardingPhaseGuests).toBe(1);
    });

    it("should throw on weddings query error", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: { users: [createMockUser("churned", 20)] },
        error: null,
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            data: null,
            error: new Error("Database connection failed"),
          }),
        }),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      await expect(repo.getBreakdown()).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("getTimeMetrics", () => {
    it("should calculate time metrics for churned users correctly", async () => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            // User created 30 days ago, churned (last login 20 days ago) = 10 days active
            {
              id: "u1",
              created_at: new Date(now - 30 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 20 * oneDay).toISOString(),
            },
            // User created 40 days ago, churned (last login 20 days ago) = 20 days active
            {
              id: "u2",
              created_at: new Date(now - 40 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 20 * oneDay).toISOString(),
            },
            // User created 50 days ago, churned (last login 20 days ago) = 30 days active
            {
              id: "u3",
              created_at: new Date(now - 50 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 20 * oneDay).toISOString(),
            },
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getTimeMetrics();

      expect(result.avgDaysToChurn).toBe(20); // (10 + 20 + 30) / 3 = 20
      expect(result.medianDaysToChurn).toBe(20); // Middle value
      expect(result.minDaysToChurn).toBe(10);
      expect(result.maxDaysToChurn).toBe(30);
    });

    it("should calculate median correctly for even number of users", async () => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            // 10 days active
            {
              id: "u1",
              created_at: new Date(now - 30 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 20 * oneDay).toISOString(),
            },
            // 20 days active
            {
              id: "u2",
              created_at: new Date(now - 40 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 20 * oneDay).toISOString(),
            },
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getTimeMetrics();

      expect(result.medianDaysToChurn).toBe(15); // (10 + 20) / 2 = 15
    });

    it("should return null metrics when no churned users", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [createMockUser("active", 1)], // Only active users
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getTimeMetrics();

      expect(result.avgDaysToChurn).toBeNull();
      expect(result.medianDaysToChurn).toBeNull();
      expect(result.minDaysToChurn).toBeNull();
      expect(result.maxDaysToChurn).toBeNull();
    });

    it("should skip churned users without created_at date", async () => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            // Valid churned user with 10 days active
            {
              id: "u1",
              created_at: new Date(now - 30 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 20 * oneDay).toISOString(),
            },
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getTimeMetrics();

      // Only one valid churned user
      expect(result.avgDaysToChurn).toBe(10);
      expect(result.minDaysToChurn).toBe(10);
      expect(result.maxDaysToChurn).toBe(10);
    });
  });

  describe("getChurnKPIs", () => {
    it("should return combined churn KPI result", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            createMockUser("active", 1),
            createMockUser("churned", 20, 40), // 20 days active before churn
          ],
        },
        error: null,
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({ data: [], error: null }),
            data: [],
            error: null,
          }),
        }),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getChurnKPIs();

      expect(result.activity).toBeDefined();
      expect(result.activity.totalUsers).toBe(2);
      expect(result.activity.active).toBe(1);
      expect(result.activity.churnedRecent).toBe(1);

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.totalChurned).toBe(1);

      expect(result.timeMetrics).toBeDefined();
      expect(result.timeMetrics.avgDaysToChurn).toBeDefined();
    });

    it("should return correct results with mixed user states", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            createMockUser("active1", 1),
            createMockUser("active2", 5),
            createMockUser("atRisk", 10),
            createMockUser("churned", 20, 50), // 30 days active
            createMockUser("dormant", 60, 90), // 30 days active
            createMockUser("never", null),
          ],
        },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [
                  { id: "w1", wedder_1_id: "churned" },
                  { id: "w2", wedder_1_id: "dormant" },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === "onboarding_sessions") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                data: [
                  {
                    wedding_id: "w1",
                    completed_phases: [
                      "PHASE_INFO",
                      "PHASE_ENGAGEMENT",
                      "PHASE_CEREMONY",
                      "PHASE_CELEBRATION",
                      "PHASE_GUESTS",
                    ],
                    completed_at: "2024-01-20",
                  },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === "wedder_answers") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getChurnKPIs();

      // Activity
      expect(result.activity.totalUsers).toBe(6);
      expect(result.activity.active).toBe(2);
      expect(result.activity.atRisk).toBe(1);
      expect(result.activity.churnedRecent).toBe(1);
      expect(result.activity.churnedDormant).toBe(1);
      expect(result.activity.neverLogged).toBe(1);

      // Breakdown - 2 churned users
      expect(result.breakdown.totalChurned).toBe(2);
      expect(result.breakdown.postOnboarding).toBe(1); // churned user
      expect(result.breakdown.onboardingPhaseInfo).toBe(1); // dormant user (no onboarding session)

      // Time metrics
      expect(result.timeMetrics.avgDaysToChurn).toBe(30); // (30 + 30) / 2
      expect(result.timeMetrics.medianDaysToChurn).toBe(30);
    });
  });

  // ========================================
  // LEGACY METHODS (for backwards compatibility)
  // ========================================

  describe("getOverview (legacy)", () => {
    it("should calculate churn overview correctly", async () => {
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
        { count: 70, data: null, error: null }, // completed
        { count: 20, data: null, error: null }, // abandoned
      ];

      let callIndex = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => {
          const result =
            mockResults[callIndex] || mockResults[mockResults.length - 1];
          callIndex++;
          return createSelectChain(result);
        }),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getOverview(
        new Date("2024-01-01"),
        new Date("2024-01-31")
      );

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
            lte: vi
              .fn()
              .mockReturnValue({ count: 0, data: null, error: null }),
          })),
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi
                .fn()
                .mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
          is: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi
                .fn()
                .mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
          count: 0,
          data: null,
          error: null,
        })),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.total).toBe(0);
      expect(result.churnRate).toBe(0);
    });

    it("should throw on database error", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({
              data: null,
              error: new Error("Database error"),
              count: null,
            }),
          })),
        })),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      await expect(repo.getOverview(new Date(), new Date())).rejects.toThrow();
    });
  });

  describe("getByStage (legacy)", () => {
    it("should calculate churn by stage correctly", async () => {
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

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
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
              contains: vi
                .fn()
                .mockReturnValue({ count: 100, data: null, error: null }),
              count: 100,
              data: null,
              error: null,
            })),
          })),
          contains: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi
                .fn()
                .mockReturnValue({ count: 100, data: null, error: null }),
            })),
          })),
          count: 100,
          data: null,
          error: null,
        })),
      }));

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getByStage(new Date(), new Date());

      expect(result.overallChurnRate).toBe(0);
    });
  });

  describe("getActivityMetrics (legacy)", () => {
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

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
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

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
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

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
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

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      await expect(repo.getActivityMetrics()).rejects.toThrow("Auth error");
    });

    it("should correctly classify inactive users (7-30 days)", async () => {
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);

      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            { id: "1", last_sign_in_at: tenDaysAgo.toISOString() },
            { id: "2", last_sign_in_at: twentyDaysAgo.toISOString() },
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivityMetrics();

      expect(result.inactiveUsers).toBe(2);
      expect(result.activeUsers).toBe(0);
      expect(result.dormantUsers).toBe(0);
    });
  });
});

// Test helper function coverage
describe("Helper functions", () => {
  describe("calculateRate", () => {
    it("should calculate rate correctly via getActivity", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            createMockUser("u1", 1),
            createMockUser("u2", 1),
            createMockUser("u3", 1),
            createMockUser("u4", 20),
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      // 3 out of 4 active = 75%
      expect(result.activeRate).toBe(75);
      // 1 out of 4 churned = 25%
      expect(result.churnRate).toBe(25);
    });

    it("should return 0 rate when total is 0", async () => {
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: { users: [] },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.activeRate).toBe(0);
      expect(result.churnRate).toBe(0);
    });
  });

  describe("categorizeUser function", () => {
    it("should categorize users correctly at boundary values", async () => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // Create users at exact boundaries (minus small epsilon for floating point)
      mockAuthAdmin.listUsers.mockResolvedValue({
        data: {
          users: [
            // Just under 7 days - active
            {
              id: "boundary7",
              created_at: new Date(now - 60 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 6.99 * oneDay).toISOString(),
            },
            // Just over 7 days - at risk
            {
              id: "boundary7over",
              created_at: new Date(now - 60 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 7.01 * oneDay).toISOString(),
            },
            // Just under 14 days - at risk
            {
              id: "boundary14",
              created_at: new Date(now - 60 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 13.99 * oneDay).toISOString(),
            },
            // Just over 14 days - churned recent
            {
              id: "boundary14over",
              created_at: new Date(now - 60 * oneDay).toISOString(),
              last_sign_in_at: new Date(now - 14.01 * oneDay).toISOString(),
            },
          ],
        },
        error: null,
      });

      const { SupabaseChurnAnalyticsRepository } = await import(
        "./ChurnAnalyticsRepository.js"
      );
      const repo = new SupabaseChurnAnalyticsRepository();

      const result = await repo.getActivity();

      expect(result.active).toBe(1);
      expect(result.atRisk).toBe(2);
      expect(result.churnedRecent).toBe(1);
    });
  });
});
