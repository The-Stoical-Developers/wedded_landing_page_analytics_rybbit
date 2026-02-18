/**
 * Drill-Down Repository Unit Tests
 *
 * Tests wedding list retrieval for drill-down analytics.
 */

import { vi, describe, it, expect, beforeEach } from "vitest";

const mockQuery = vi.fn();
const mockQueryOne = vi.fn();

vi.mock("./queryHelper.js", () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  queryCount: vi.fn(),
}));

import { PgDrillDownRepository } from "./DrillDownRepository.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PgDrillDownRepository", () => {
  const defaultParams = {
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
    page: 1,
    pageSize: 20,
  };

  describe("getWeddingsByDropOffQuestion", () => {
    it("should return weddings that dropped off at a specific question", async () => {
      const mockIncompleteSessions = [
        { wedding_id: "w1" },
        { wedding_id: "w2" },
        { wedding_id: "w3" },
      ];
      const mockAnswers = [
        { wedding_id: "w1", question_id: "q1", answered_at: "2024-01-15T10:00:00Z" },
        { wedding_id: "w1", question_id: "q2", answered_at: "2024-01-15T09:00:00Z" },
        { wedding_id: "w2", question_id: "q1", answered_at: "2024-01-15T10:00:00Z" },
        { wedding_id: "w3", question_id: "q2", answered_at: "2024-01-15T10:00:00Z" },
      ];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockSessions = [
        { wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: null },
      ];

      // Order: 1) incomplete sessions, 2) answers, 3) fetchWeddingSummaries -> weddings, 4) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockIncompleteSessions)
        .mockResolvedValueOnce(mockAnswers)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockSessions);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByDropOffQuestion("q1", defaultParams);

      expect(result.weddings).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it("should return empty result when no incomplete sessions", async () => {
      // 1) incomplete sessions -> empty
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByDropOffQuestion("q1", defaultParams);

      expect(result.weddings).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should throw error on database failure", async () => {
      // 1) incomplete sessions -> reject
      mockQuery.mockRejectedValueOnce(new Error("DB Error"));

      const repo = new PgDrillDownRepository();
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

      // Order: 1) sessions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboardingSessions);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByChurnStage("never_started", defaultParams);

      expect(result.total).toBe(2);
      expect(result.weddings).toHaveLength(2);
    });

    it("should return empty result for invalid stage", async () => {
      const repo = new PgDrillDownRepository();
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

      // Order: 1) sessions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboardingSessions);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByChurnStage("abandoned_info", defaultParams);

      expect(result.total).toBe(1);
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

      // Order: 1) sessions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockSessions);

      const repo = new PgDrillDownRepository();
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
      const mockCompletedSessions = [
        { wedding_id: "w1", completed_phases: ["PHASE_INFO", "PHASE_ENGAGEMENT", "PHASE_CEREMONY", "PHASE_CELEBRATION", "PHASE_GUESTS"], completed_at: "2024-01-20T10:00:00Z" },
      ];

      // Order: 1) sessions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockCompletedSessions);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByJourneyStage("onboarding_completed", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return empty result for invalid stage", async () => {
      const repo = new PgDrillDownRepository();
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

      // Order per getWeddingDetail:
      // 1) queryOne: wedding
      // 2) queryOne: wedder1 (fetchWedderSummary)
      // 3) queryOne: wedder2 (fetchWedderSummary)
      // 4) queryOne: onboarding session
      // 5) query: tasks
      // 6) query: vendors (retailers_in_weddings)
      // 7) query: missions
      mockQueryOne
        .mockResolvedValueOnce(mockWedding)
        .mockResolvedValueOnce(mockWedder1)
        .mockResolvedValueOnce(mockWedder2)
        .mockResolvedValueOnce(mockOnboarding);
      mockQuery
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockVendors)
        .mockResolvedValueOnce(mockMissions);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingDetail("w1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("w1");
      expect(result?.weddingDate).toBe("2024-06-15");
      expect(result?.onboarding.status).toBe("in_progress");
      expect(result?.tasks.total).toBe(3);
      expect(result?.tasks.completed).toBe(2);
    });

    it("should return null for non-existent wedding", async () => {
      // 1) queryOne: wedding -> null
      mockQueryOne.mockResolvedValueOnce(null);

      const repo = new PgDrillDownRepository();
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

      // Order per getWedderDetail:
      // 1) queryOne: wedder
      // 2) query: weddingsAsWedder1
      // 3) query: weddingsAsWedder2
      // 4) query: fetchWeddingSummaries -> weddings
      // 5) query: fetchWeddingSummaries -> onboarding_sessions
      mockQueryOne.mockResolvedValueOnce(mockWedder);
      mockQuery
        .mockResolvedValueOnce(mockWeddingsAsWedder1)
        .mockResolvedValueOnce(mockWeddingsAsWedder2)
        .mockResolvedValueOnce(mockWeddingDetails)
        .mockResolvedValueOnce(mockOnboardingSessions);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWedderDetail("u1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("u1");
      expect(result?.countryCode).toBe("ES");
      expect(result?.weddings).toHaveLength(3);
    });

    it("should return null for non-existent wedder", async () => {
      // 1) queryOne: wedder -> null
      mockQueryOne.mockResolvedValueOnce(null);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWedderDetail("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getWeddingsByKPIFilter", () => {
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

      // Order: 1) sessions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
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

      // Order: 1) sessions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("completed", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for active KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) active weddings, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("active", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for with-partner KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: "u2" },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) with-partner weddings, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
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

      // Order: 1) tasks, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("with-tasks", defaultParams);

      expect(result.total).toBe(2);
    });

    it("should return empty result for unknown KPI slug", async () => {
      // "unknown-kpi" hits the default case which queries weddings
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("unknown-kpi", defaultParams);

      expect(result.weddings).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return weddings for ceremony-date-set-rate KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2024-06-15", archived: false, wedder_1_id: "u1", wedder_2_id: null, ceremony_date: "2024-06-15" },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) weddings with date, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("ceremony-date-set-rate", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for without-ceremony-date KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) weddings without date, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("without-ceremony-date", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for without-celebration-date KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) weddings without celebration date, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("without-celebration-date", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for never-started churn KPI", async () => {
      const mockSessions = [{ wedding_id: "w1", completed_phases: [] }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) sessions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("never-started", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for abandoned churn KPI", async () => {
      const mockSessions = [{ wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: null }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: null }];

      // Order: 1) sessions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("abandoned", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for with-vendors KPI", async () => {
      const mockVendors = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) vendors, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockVendors)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("with-vendors", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for avg-tasks KPI", async () => {
      const mockTasks = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) tasks, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("avg-tasks", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for avg-vendors KPI", async () => {
      const mockVendors = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) vendors, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockVendors)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("avg-vendors", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for upcoming-30-days KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) upcoming weddings, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("upcoming-30-days", defaultParams);

      expect(result).toBeDefined();
    });

    it("should return weddings for past-ceremony KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2023-12-01", archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) past-ceremony weddings, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("past-ceremony", defaultParams);

      expect(result).toBeDefined();
    });

    it("should return weddings for same-day-events KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2024-06-15", engagement_date: "2024-06-15", archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockWeddingSummaries = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2024-06-15", archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) same-day weddings, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockWeddingSummaries)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("same-day-events", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for multi-day-events KPI", async () => {
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2024-06-15", engagement_date: "2024-06-16", archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockWeddingSummaries = [
        { id: "w1", created_at: "2024-01-10", wedding_date: "2024-06-15", archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) multi-day weddings, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockWeddingSummaries)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("multi-day-events", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for missions-started KPI", async () => {
      const mockMissions = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) missions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockMissions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("missions-started", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for missions-completed KPI", async () => {
      const mockMissions = [{ wedding_id: "w1", status: "COMPLETED" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) completed missions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockMissions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("missions-completed", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for ceremony-venue-booked KPI", async () => {
      const mockMissions = [{ wedding_id: "w1", template_id: "CEREMONY_VENUE", status: "COMPLETED" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) ceremony missions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockMissions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("ceremony-venue-booked", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for celebration-venue-booked KPI", async () => {
      const mockMissions = [{ wedding_id: "w1", template_id: "CELEBRATION_VENUE", status: "COMPLETED" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: [], completed_at: null }];

      // Order: 1) celebration missions, 2) fetchWeddingSummaries -> weddings, 3) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockMissions)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("celebration-venue-booked", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return weddings for fully-engaged KPI", async () => {
      const mockOnboardingSessions = [{ wedding_id: "w1" }];
      const mockTasks = [{ wedding_id: "w1" }];
      const mockVendors = [{ wedding_id: "w1" }];
      const mockWeddings = [
        { id: "w1", created_at: "2024-01-10", wedding_date: null, archived: false, wedder_1_id: "u1", wedder_2_id: null },
      ];
      const mockOnboarding = [{ wedding_id: "w1", completed_phases: ["PHASE_INFO"], completed_at: "2024-01-15" }];

      // Order for fully-engaged:
      // 1) completed onboarding sessions
      // 2) tasks (all)
      // 3) vendors (all)
      // 4) fetchWeddingSummaries -> weddings
      // 5) fetchWeddingSummaries -> onboarding_sessions
      mockQuery
        .mockResolvedValueOnce(mockOnboardingSessions)
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockVendors)
        .mockResolvedValueOnce(mockWeddings)
        .mockResolvedValueOnce(mockOnboarding);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("fully-engaged", defaultParams);

      expect(result.total).toBe(1);
    });

    it("should return empty results when no matching wedding IDs", async () => {
      // "started" case: 1) sessions -> empty
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgDrillDownRepository();
      const result = await repo.getWeddingsByKPIFilter("started", defaultParams);

      expect(result.weddings).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
