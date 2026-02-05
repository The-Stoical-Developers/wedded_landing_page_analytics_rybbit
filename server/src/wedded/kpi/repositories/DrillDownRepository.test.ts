/**
 * Drill-Down Repository Unit Tests
 *
 * Tests wedding list retrieval for drill-down analytics.
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
  vi.resetModules();
});

describe("SupabaseDrillDownRepository", () => {
  const defaultParams = {
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
    page: 1,
    pageSize: 20,
  };

  describe("getWeddingsByDropOffQuestion", () => {
    it("should return weddings that dropped off at a specific question", async () => {
      // Mock incomplete sessions
      const mockIncompleteSessions = [
        { wedding_id: "w1" },
        { wedding_id: "w2" },
        { wedding_id: "w3" },
      ];
      // Mock answers with last answered questions
      const mockAnswers = [
        { wedding_id: "w1", question_id: "q1", answered_at: "2024-01-15T10:00:00Z" },
        { wedding_id: "w1", question_id: "q2", answered_at: "2024-01-15T09:00:00Z" },
        { wedding_id: "w2", question_id: "q1", answered_at: "2024-01-15T10:00:00Z" },
        { wedding_id: "w3", question_id: "q2", answered_at: "2024-01-15T10:00:00Z" },
      ];
      // Mock wedding details
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockSessions = [
        { wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: null },
      ];

      let queryIndex = 0;
      mockFrom.mockImplementation((table: string) => {
        const createChain = (result: unknown) => {
          const chain: Record<string, ReturnType<typeof vi.fn>> = {};
          chain.select = vi.fn().mockImplementation(() => chain);
          chain.is = vi.fn().mockImplementation(() => chain);
          chain.gte = vi.fn().mockImplementation(() => chain);
          chain.lte = vi.fn().mockImplementation(() => chain);
          chain.in = vi.fn().mockImplementation(() => chain);
          chain.not = vi.fn().mockImplementation(() => chain);
          chain.order = vi.fn().mockReturnValue(result);
          chain.eq = vi.fn().mockImplementation(() => chain);
          chain.single = vi.fn().mockReturnValue(result);
          // For queries without order, return on lte
          const origLte = chain.lte;
          chain.lte = vi.fn().mockImplementation(() => {
            if (table === "onboarding_sessions" && queryIndex === 0) {
              queryIndex++;
              return { data: mockIncompleteSessions, error: null };
            }
            if (table === "onboarding_sessions" && queryIndex > 2) {
              return { data: mockSessions, error: null };
            }
            return origLte();
          });
          return chain;
        };

        if (table === "onboarding_sessions") {
          return createChain({ data: mockIncompleteSessions, error: null });
        }
        if (table === "wedder_answers") {
          return createChain({ data: mockAnswers, error: null });
        }
        if (table === "weddings") {
          return createChain({ data: mockWeddings, error: null });
        }
        return createChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByDropOffQuestion("q1", defaultParams);

      expect(result.weddings).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it("should return empty result when no incomplete sessions", async () => {
      mockFrom.mockImplementation(() => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.is = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockReturnValue({ data: [], error: null });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByDropOffQuestion("q1", defaultParams);

      expect(result.weddings).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should throw error on database failure", async () => {
      mockFrom.mockImplementation(() => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.is = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockReturnValue({ data: null, error: new Error("DB Error") });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      await expect(repo.getWeddingsByDropOffQuestion("q1", defaultParams)).rejects.toThrow();
    });
  });

  describe("getWeddingsByChurnStage", () => {
    it("should return weddings that churned at never_started stage", async () => {
      const mockSessions = [
        { wedding_id: "w1", completed_phases: [] },
        { wedding_id: "w2", completed_phases: ["PHASE_INFO"] },
        { wedding_id: "w3", completed_phases: [] },
      ];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
        { id: "w3", created_at: "2024-01-12", wedding_date: null, archived: false, wedder_1_id: "u3", wedder_2_id: null },
      ];
      const mockOnboardingSessions = [
        { wedding_id: "w1", completed_phases: [], completed_at: null },
        { wedding_id: "w3", completed_phases: [], completed_at: null },
      ];

      mockFrom.mockImplementation((table: string) => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.is = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockImplementation(() => {
          if (table === "onboarding_sessions") {
            return { data: mockSessions, error: null };
          }
          return chain;
        });
        chain.in = vi.fn().mockImplementation(() => {
          if (table === "weddings") {
            return { data: mockWeddings, error: null };
          }
          if (table === "onboarding_sessions") {
            return { data: mockOnboardingSessions, error: null };
          }
          return chain;
        });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByChurnStage("never_started", defaultParams);

      expect(result.total).toBe(2); // w1 and w3 have empty completed_phases
      expect(result.weddings).toHaveLength(2);
    });

    it("should return empty result for invalid stage", async () => {
      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByChurnStage("invalid_stage", defaultParams);

      expect(result.weddings).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return weddings for abandoned_info stage", async () => {
      const mockSessions = [
        { wedding_id: "w1", completed_phases: ["PHASE_INFO"] },
        { wedding_id: "w2", completed_phases: ["PHASE_INFO", "PHASE_ENGAGEMENT"] },
      ];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboardingSessions = [
        { wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: null },
      ];

      mockFrom.mockImplementation((table: string) => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.is = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockImplementation(() => {
          if (table === "onboarding_sessions") {
            return { data: mockSessions, error: null };
          }
          return chain;
        });
        chain.in = vi.fn().mockImplementation(() => {
          if (table === "weddings") {
            return { data: mockWeddings, error: null };
          }
          if (table === "onboarding_sessions") {
            return { data: mockOnboardingSessions, error: null };
          }
          return chain;
        });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByChurnStage("abandoned_info", defaultParams);

      expect(result.total).toBe(1); // Only w1 has INFO but not ENGAGEMENT
    });
  });

  describe("getWeddingsByJourneyStage", () => {
    it("should return weddings for registered/wedding_created stage", async () => {
      const mockSessions = [
        { wedding_id: "w1", completed_phases: [], completed_at: null },
        { wedding_id: "w2", completed_phases: ["PHASE_INFO"], completed_at: null },
      ];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
        { id: "w2", created_at: "2024-01-11", wedding_date: null, archived: false, wedder_1_id: "u2", wedder_2_id: null },
      ];

      mockFrom.mockImplementation((table: string) => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockImplementation(() => {
          if (table === "onboarding_sessions") {
            return { data: mockSessions, error: null };
          }
          return chain;
        });
        chain.in = vi.fn().mockImplementation(() => {
          if (table === "weddings") {
            return { data: mockWeddings, error: null };
          }
          if (table === "onboarding_sessions") {
            return { data: mockSessions, error: null };
          }
          return chain;
        });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByJourneyStage("registered", defaultParams);

      expect(result.total).toBe(2);
    });

    it("should return weddings for onboarding_completed stage", async () => {
      const mockSessions = [
        { wedding_id: "w1", completed_phases: ["PHASE_INFO", "PHASE_ENGAGEMENT", "PHASE_CEREMONY", "PHASE_CELEBRATION", "PHASE_GUESTS"], completed_at: "2024-01-20T10:00:00Z" },
        { wedding_id: "w2", completed_phases: ["PHASE_INFO"], completed_at: null },
      ];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];

      mockFrom.mockImplementation((table: string) => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockImplementation(() => {
          if (table === "onboarding_sessions") {
            return { data: mockSessions, error: null };
          }
          return chain;
        });
        chain.in = vi.fn().mockImplementation(() => {
          if (table === "weddings") {
            return { data: mockWeddings, error: null };
          }
          if (table === "onboarding_sessions") {
            return { data: mockSessions.filter(s => s.completed_at), error: null };
          }
          return chain;
        });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByJourneyStage("onboarding_completed", defaultParams);

      expect(result.total).toBe(1); // Only w1 has completed_at
    });

    it("should return empty result for invalid stage", async () => {
      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByJourneyStage("invalid_stage", defaultParams);

      expect(result.weddings).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("getWeddingDetail", () => {
    it("should return full wedding detail", async () => {
      const mockWedding = {
        id: "w1",
        created_at: "2024-01-10T10:00:00Z",
        wedding_date: "2024-06-15",
        archived: false,
        wedder_1_id: "u1",
        wedder_2_id: "u2",
      };
      const mockWedder1 = { id: "u1", first_name: "Alice", created_at: "2024-01-05", country_code: "ES", provider: "google" };
      const mockWedder2 = { id: "u2", first_name: "Bob", created_at: "2024-01-06", country_code: "ES", provider: "apple" };
      const mockOnboarding = { completed_phases: ["PHASE_INFO", "PHASE_ENGAGEMENT"], completed_at: null };
      const mockTasks = [{ completed: true }, { completed: false }, { completed: true }];
      const mockVendors = [{ status: "SAVED" }, { status: "HIRED" }, { status: "CONTACTED" }];
      const mockMissions = [
        { template_id: "CEREMONY_VENUE", status: "COMPLETED" },
        { template_id: "CELEBRATION_VENUE", status: "IN_PROGRESS" },
      ];

      mockFrom.mockImplementation((table: string) => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.eq = vi.fn().mockImplementation(() => chain);
        chain.is = vi.fn().mockImplementation(() => chain);
        chain.in = vi.fn().mockImplementation(() => chain);
        chain.single = vi.fn().mockImplementation(() => {
          if (table === "weddings") return { data: mockWedding, error: null };
          if (table === "wedders") {
            // Return different wedders based on call order
            return { data: mockWedder1, error: null };
          }
          if (table === "onboarding_sessions") return { data: mockOnboarding, error: null };
          return { data: null, error: null };
        });
        // For non-single queries
        if (table === "tasks") {
          chain.is = vi.fn().mockReturnValue({ data: mockTasks, error: null });
        }
        if (table === "retailers_in_weddings") {
          chain.is = vi.fn().mockReturnValue({ data: mockVendors, error: null });
        }
        if (table === "missions") {
          chain.in = vi.fn().mockReturnValue({ data: mockMissions, error: null });
        }
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingDetail("w1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("w1");
      expect(result?.weddingDate).toBe("2024-06-15");
      expect(result?.onboarding.status).toBe("in_progress");
      expect(result?.tasks.total).toBe(3);
      expect(result?.tasks.completed).toBe(2);
    });

    it("should return null for non-existent wedding", async () => {
      mockFrom.mockImplementation(() => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.eq = vi.fn().mockImplementation(() => chain);
        chain.single = vi.fn().mockReturnValue({ data: null, error: { code: "PGRST116" } });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingDetail("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getWedderDetail", () => {
    it("should return wedder with their weddings", async () => {
      const mockWedder = { id: "u1", created_at: "2024-01-05", country_code: "ES", provider: "google" };
      const mockWeddingsAsWedder1 = [{ id: "w1" }, { id: "w2" }];
      const mockWeddingsAsWedder2 = [{ id: "w3" }];
      const mockWeddingDetails = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
        { id: "w2", created_at: "2024-01-11", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: "u2" },
        { id: "w3", created_at: "2024-01-12", wedding_date: null, archived: false, wedder_1_id: "u3", wedder_2_id: "u1" },
      ];
      const mockOnboardingSessions = [
        { wedding_id: "w1", completed_phases: [], completed_at: null },
        { wedding_id: "w2", completed_phases: ["PHASE_INFO"], completed_at: null },
        { wedding_id: "w3", completed_phases: [], completed_at: "2024-01-20" },
      ];

      let weddingsQueryCount = 0;
      mockFrom.mockImplementation((table: string) => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.eq = vi.fn().mockImplementation(() => {
          if (table === "weddings") {
            weddingsQueryCount++;
            if (weddingsQueryCount === 1) {
              return { data: mockWeddingsAsWedder1, error: null };
            }
            if (weddingsQueryCount === 2) {
              return { data: mockWeddingsAsWedder2, error: null };
            }
          }
          return chain;
        });
        chain.single = vi.fn().mockImplementation(() => {
          if (table === "wedders") return { data: mockWedder, error: null };
          return { data: null, error: null };
        });
        chain.in = vi.fn().mockImplementation(() => {
          if (table === "weddings") return { data: mockWeddingDetails, error: null };
          if (table === "onboarding_sessions") return { data: mockOnboardingSessions, error: null };
          return chain;
        });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWedderDetail("u1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("u1");
      expect(result?.countryCode).toBe("ES");
      expect(result?.weddings).toHaveLength(3);
    });

    it("should return null for non-existent wedder", async () => {
      mockFrom.mockImplementation(() => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.eq = vi.fn().mockImplementation(() => chain);
        chain.single = vi.fn().mockReturnValue({ data: null, error: { code: "PGRST116" } });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWedderDetail("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getWeddingsByKPIFilter", () => {
    const createMockChain = (result: unknown) => {
      const chain: Record<string, ReturnType<typeof vi.fn>> = {};
      chain.select = vi.fn().mockImplementation(() => chain);
      chain.eq = vi.fn().mockImplementation(() => chain);
      chain.is = vi.fn().mockImplementation(() => chain);
      chain.not = vi.fn().mockImplementation(() => chain);
      chain.gte = vi.fn().mockImplementation(() => chain);
      chain.lte = vi.fn().mockReturnValue(result);
      chain.in = vi.fn().mockReturnValue(result);
      return chain;
    };

    it("should return weddings for started KPI", async () => {
      const mockSessions = [{ wedding_id: "w1" }, { wedding_id: "w2" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
        { id: "w2", created_at: "2024-01-11", wedding_date: null, archived: false, wedder_1_id: "u2", wedder_2_id: null },
      ];
      const mockOnboarding = [
        { wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: null },
        { wedding_id: "w2", completed_phases: [], completed_at: null },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockSessions, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        return createMockChain({ data: mockOnboarding, error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("started", defaultParams);

      expect(result.total).toBe(2);
      expect(result.weddings).toHaveLength(2);
    });

    it("should return weddings for completed KPI", async () => {
      const mockSessions = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [
        { wedding_id: "w1", completed_phases: ["PHASE_INFO", "PHASE_ENGAGEMENT", "PHASE_CEREMONY", "PHASE_CELEBRATION", "PHASE_GUESTS"], completed_at: "2024-01-20" },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockSessions, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        return createMockChain({ data: mockOnboarding, error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("completed", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for active KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("active", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for with-partner KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: "u2" },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("with-partner", defaultParams);

      expect(result.total).toBe(1);
      expect(result.weddings[0].hasPartner).toBe(true);
    });

    it("should return weddings for with-tasks KPI", async () => {
      const mockTasks = [{ wedding_id: "w1" }, { wedding_id: "w2" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
        { id: "w2", created_at: "2024-01-11", wedding_date: null, archived: false, wedder_1_id: "u2", wedder_2_id: null },
      ];
      const mockOnboarding = [
        { wedding_id: "w1", completed_phases: [], completed_at: null },
        { wedding_id: "w2", completed_phases: [], completed_at: null },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === "tasks") {
          return createMockChain({ data: mockTasks, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("with-tasks", defaultParams);

      expect(result.total).toBe(2);
    });

    it("should return empty result for unknown KPI slug", async () => {
      // Reset mock to ensure clean state
      mockFrom.mockImplementation(() => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.eq = vi.fn().mockImplementation(() => chain);
        chain.is = vi.fn().mockImplementation(() => chain);
        chain.not = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockReturnValue({ data: [], error: null });
        chain.in = vi.fn().mockReturnValue({ data: [], error: null });
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("unknown-kpi", defaultParams);

      expect(result.weddings).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return weddings for ceremony-date-set-rate KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2024-06-15", archived: false, wedder_1_id: "u1", wedder_2_id: null, ceremony_date: "2024-06-15" },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("ceremony-date-set-rate", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for without-ceremony-date KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("without-ceremony-date", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for without-celebration-date KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("without-celebration-date", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for never-started churn KPI", async () => {
      const mockSessions = [{ wedding_id: "w1", completed_phases: [] }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockSessions, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        return createMockChain({ data: mockOnboarding, error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("never-started", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for abandoned churn KPI", async () => {
      const mockSessions = [{ wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: null }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockSessions, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        return createMockChain({ data: mockOnboarding, error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("abandoned", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for with-vendors KPI", async () => {
      const mockVendors = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "retailers_in_weddings") {
          return createMockChain({ data: mockVendors, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("with-vendors", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for avg-tasks KPI", async () => {
      const mockTasks = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "tasks") {
          return createMockChain({ data: mockTasks, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("avg-tasks", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for avg-vendors KPI", async () => {
      const mockVendors = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "retailers_in_weddings") {
          return createMockChain({ data: mockVendors, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("avg-vendors", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for upcoming-30-days KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.eq = vi.fn().mockImplementation(() => chain);
        chain.is = vi.fn().mockImplementation(() => chain);
        chain.not = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockImplementation(() => chain);
        chain.lt = vi.fn().mockImplementation(() => chain);
        chain.in = vi.fn().mockImplementation(() => {
          if (table === "weddings") return { data: mockWeddings, error: null };
          if (table === "onboarding_sessions") return { data: mockOnboarding, error: null };
          return { data: [], error: null };
        });
        // For wedding queries
        if (table === "weddings") {
          chain.eq = vi.fn().mockReturnValue({ data: mockWeddings, error: null });
        }
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("upcoming-30-days", defaultParams);

      expect(result).toBeDefined();
    });

    it("should return weddings for past-ceremony KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2023-12-01", archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.eq = vi.fn().mockImplementation(() => chain);
        chain.is = vi.fn().mockImplementation(() => chain);
        chain.not = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockImplementation(() => chain);
        chain.lt = vi.fn().mockImplementation(() => chain);
        chain.in = vi.fn().mockImplementation(() => {
          if (table === "weddings") return { data: mockWeddings, error: null };
          if (table === "onboarding_sessions") return { data: mockOnboarding, error: null };
          return { data: [], error: null };
        });
        if (table === "weddings") {
          chain.not = vi.fn().mockReturnValue({ data: mockWeddings, error: null });
        }
        return chain;
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("past-ceremony", defaultParams);

      expect(result).toBeDefined();
    });

    it("should return weddings for same-day-events KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2024-06-15", ceremony_date: "2024-06-15", celebration_date: "2024-06-15", archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("same-day-events", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for multi-day-events KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2024-06-15", ceremony_date: "2024-06-15", celebration_date: "2024-06-16", archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("multi-day-events", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for missions-started KPI", async () => {
      const mockMissions = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "missions") {
          return createMockChain({ data: mockMissions, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("missions-started", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for missions-completed KPI", async () => {
      const mockMissions = [{ wedding_id: "w1", status: "COMPLETED" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "missions") {
          return createMockChain({ data: mockMissions, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("missions-completed", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for ceremony-venue-booked KPI", async () => {
      const mockMissions = [{ wedding_id: "w1", template_id: "CEREMONY_VENUE", status: "COMPLETED" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "missions") {
          return createMockChain({ data: mockMissions, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("ceremony-venue-booked", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for celebration-venue-booked KPI", async () => {
      const mockMissions = [{ wedding_id: "w1", template_id: "CELEBRATION_VENUE", status: "COMPLETED" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      mockFrom.mockImplementation((table: string) => {
        if (table === "missions") {
          return createMockChain({ data: mockMissions, error: null });
        }
        if (table === "weddings") {
          return createMockChain({ data: mockWeddings, error: null });
        }
        if (table === "onboarding_sessions") {
          return createMockChain({ data: mockOnboarding, error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("celebration-venue-booked", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for fully-engaged KPI", async () => {
      const mockOnboardingSessions = [{ wedding_id: "w1", completed_at: "2024-01-15" }];
      const mockTasks = [{ wedding_id: "w1" }];
      const mockVendors = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: "2024-01-15" }];

      // Custom mock chain that also returns result on .is() for tasks/vendors queries
      const createFullyEngagedMockChain = (result: unknown, returnOnIs = false) => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.select = vi.fn().mockImplementation(() => chain);
        chain.eq = vi.fn().mockImplementation(() => chain);
        chain.is = vi.fn().mockImplementation(() => returnOnIs ? result : chain);
        chain.not = vi.fn().mockImplementation(() => chain);
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockReturnValue(result);
        chain.in = vi.fn().mockReturnValue(result);
        return chain;
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "onboarding_sessions") {
          return createFullyEngagedMockChain({ data: mockOnboardingSessions, error: null });
        }
        if (table === "tasks") {
          // Tasks query ends with .is(), so return result on is()
          return createFullyEngagedMockChain({ data: mockTasks, error: null }, true);
        }
        if (table === "retailers_in_weddings") {
          // Vendors query ends with .is(), so return result on is()
          return createFullyEngagedMockChain({ data: mockVendors, error: null }, true);
        }
        if (table === "weddings") {
          return createFullyEngagedMockChain({ data: mockWeddings, error: null });
        }
        return createFullyEngagedMockChain({ data: mockOnboarding, error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("fully-engaged", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return empty results when no matching wedding IDs", async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === "onboarding_sessions") {
          // Return empty sessions
          return createMockChain({ data: [], error: null });
        }
        return createMockChain({ data: [], error: null });
      });

      const { SupabaseDrillDownRepository } = await import("./DrillDownRepository.js");
      const repo = new SupabaseDrillDownRepository();

      const result = await repo.getWeddingsByKPIFilter("started", defaultParams);

      expect(result.weddings).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
