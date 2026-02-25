/**
 * Onboarding Analytics Repository Unit Tests
 *
 * Tests funnel, time analysis, and drop-off data aggregation.
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
import { PgOnboardingAnalyticsRepository } from "./OnboardingAnalyticsRepository.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PgOnboardingAnalyticsRepository", () => {
  describe("getFunnel", () => {
    it("should calculate funnel stages correctly", async () => {
      // 1st call: total sessions count
      mockQueryCount.mockResolvedValueOnce(100);
      // 2nd-6th calls: phase counts (one per ONBOARDING_PHASES)
      mockQueryCount.mockResolvedValueOnce(90);  // PHASE_INFO
      mockQueryCount.mockResolvedValueOnce(80);  // PHASE_ENGAGEMENT
      mockQueryCount.mockResolvedValueOnce(70);  // PHASE_CEREMONY
      mockQueryCount.mockResolvedValueOnce(60);  // PHASE_CELEBRATION
      mockQueryCount.mockResolvedValueOnce(50);  // PHASE_GUESTS

      const repo = new PgOnboardingAnalyticsRepository();

      const result = await repo.getFunnel(new Date(), new Date());

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // First stage is "weddings_created" with total count
      expect(result[0].stage).toBe("weddings_created");
      expect(result[0].count).toBe(100);
      // Phase stages follow
      expect(result[1].stage).toBe("PHASE_INFO");
      expect(result[1].count).toBe(90);
      expect(result[2].count).toBe(80);
      expect(result[3].count).toBe(70);
      expect(result[4].count).toBe(60);
      expect(result[5].count).toBe(50);
    });

    it("should return empty funnel when no sessions exist", async () => {
      // Total sessions: 0
      mockQueryCount.mockResolvedValueOnce(0);
      // All 5 phases: 0
      mockQueryCount.mockResolvedValueOnce(0);
      mockQueryCount.mockResolvedValueOnce(0);
      mockQueryCount.mockResolvedValueOnce(0);
      mockQueryCount.mockResolvedValueOnce(0);
      mockQueryCount.mockResolvedValueOnce(0);

      const repo = new PgOnboardingAnalyticsRepository();

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

      // 1st query: completed sessions
      mockQuery.mockResolvedValueOnce(completedSessions);
      // 2nd query: phase timing answers
      mockQuery.mockResolvedValueOnce(phaseTimingData);

      const repo = new PgOnboardingAnalyticsRepository();

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
      // 1st query: completed sessions - empty
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgOnboardingAnalyticsRepository();

      const result = await repo.getTimeAnalysis(new Date(), new Date());

      expect(result.avgDuration).toBe(0);
      expect(result.medianDuration).toBe(0);
      expect(result.p90Duration).toBe(0);
      expect(result.sampleSize).toBe(0);
    });

    it("should handle null data", async () => {
      // 1st query: completed sessions - empty (queryHelper returns [] not null)
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgOnboardingAnalyticsRepository();

      const result = await repo.getTimeAnalysis(new Date(), new Date());

      expect(result.sampleSize).toBe(0);
    });
  });

  describe("getDropOffs", () => {
    it("should identify top drop-off questions", async () => {
      // 1st call: queryCount for total sessions
      mockQueryCount.mockResolvedValueOnce(100);
      // 2nd call: query for incomplete sessions
      mockQuery.mockResolvedValueOnce([{ wedding_id: "w1" }, { wedding_id: "w2" }]);
      // 3rd call: query for all answers for incomplete weddings
      mockQuery.mockResolvedValueOnce([
        { wedding_id: "w1", question_id: "q1", answered_at: "2024-01-01T10:00:00Z" },
        { wedding_id: "w1", question_id: "q2", answered_at: "2024-01-01T10:05:00Z" },
        { wedding_id: "w2", question_id: "q1", answered_at: "2024-01-01T11:00:00Z" },
      ]);

      const repo = new PgOnboardingAnalyticsRepository();

      const result = await repo.getDropOffs(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.totalStarted).toBeDefined();
      expect(result.totalDropOffs).toBeDefined();
      expect(result.topQuestions).toBeDefined();
    });

    it("should return zeros when no drop-offs", async () => {
      // Total sessions
      mockQueryCount.mockResolvedValueOnce(100);
      // Incomplete sessions - none
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgOnboardingAnalyticsRepository();

      const result = await repo.getDropOffs(new Date(), new Date());

      expect(result.totalDropOffs).toBe(0);
      expect(result.topQuestions).toEqual([]);
    });

    it("should return empty topQuestions when incomplete sessions have no answers", async () => {
      // Total sessions
      mockQueryCount.mockResolvedValueOnce(100);
      // Incomplete sessions - there are some
      mockQuery.mockResolvedValueOnce([{ wedding_id: "w1" }, { wedding_id: "w2" }]);
      // Answers - empty array (no answers for these weddings)
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgOnboardingAnalyticsRepository();

      const result = await repo.getDropOffs(new Date(), new Date());

      expect(result.totalDropOffs).toBe(2);
      expect(result.totalStarted).toBe(100);
      expect(result.topQuestions).toEqual([]);
    });
  });
});
