/**
 * Journey Analytics Repository Unit Tests
 *
 * Tests journey funnel, milestones, and timeline data aggregation.
 */

import { vi, describe, it, expect, beforeEach } from "vitest";

const mockQuery = vi.fn();
const mockQueryOne = vi.fn();
const mockQueryCount = vi.fn();

vi.mock("./queryHelper.js", () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  queryCount: (...args: unknown[]) => mockQueryCount(...args),
}));

import { PgJourneyAnalyticsRepository } from "./JourneyAnalyticsRepository.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PgJourneyAnalyticsRepository", () => {
  describe("getFunnel", () => {
    it("should calculate journey funnel correctly", async () => {
      // Order of calls in getFunnel:
      // 1. query: wedders (registered users)
      // 2. query: weddings (for cohort)
      // 3. query: onboarding_sessions
      // 4. query: wedder_answers (tutorial)
      // 5. query: missions (getMissionCountsForCohort)
      mockQuery
        .mockResolvedValueOnce([
          { id: "u1", created_at: "2024-01-01" },
          { id: "u2", created_at: "2024-01-02" },
        ]) // wedders
        .mockResolvedValueOnce([
          { id: "w1", wedder_1_id: "u1", created_at: "2024-01-01" },
        ]) // weddings
        .mockResolvedValueOnce([
          { wedding_id: "w1", completed_phases: ["PHASE_CELEBRATION"], completed_at: "2024-01-01" },
        ]) // onboarding_sessions
        .mockResolvedValueOnce([
          { wedding_id: "w1" },
        ]) // wedder_answers (tutorial)
        .mockResolvedValueOnce([]); // missions

      const repo = new PgJourneyAnalyticsRepository();

      const result = await repo.getFunnel(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.stages).toBeDefined();
      expect(result.totalUsers).toBeGreaterThanOrEqual(0);
      expect(result.overallCompletionRate).toBeDefined();
    });

    it("should handle zero registrations", async () => {
      // Empty wedders
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgJourneyAnalyticsRepository();

      const result = await repo.getFunnel(new Date(), new Date());

      expect(result.totalUsers).toBe(0);
      expect(result.overallCompletionRate).toBe(0);
    });

    it("should throw on database error", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Query failed"));

      const repo = new PgJourneyAnalyticsRepository();

      await expect(repo.getFunnel(new Date(), new Date())).rejects.toThrow("Query failed");
    });
  });

  describe("getMilestones", () => {
    it("should calculate milestone achievements", async () => {
      // Order: queryCount(total weddings), query(missions)
      mockQueryCount.mockResolvedValueOnce(100); // total weddings

      mockQuery.mockResolvedValueOnce([
        { template_id: "CEREMONY_VENUE", wedding_id: "w1", created_at: "2024-01-01", updated_at: "2024-01-05", status: "COMPLETED" },
        { template_id: "CELEBRATION_VENUE", wedding_id: "w2", created_at: "2024-01-02", updated_at: "2024-01-08", status: "COMPLETED" },
      ]); // missions

      const repo = new PgJourneyAnalyticsRepository();

      const result = await repo.getMilestones(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.milestones).toBeDefined();
      expect(result.milestones.length).toBe(3);
      expect(result.totalWeddings).toBe(100);
    });

    it("should handle no weddings", async () => {
      mockQueryCount.mockResolvedValueOnce(0); // total weddings
      mockQuery.mockResolvedValueOnce([]); // missions

      const repo = new PgJourneyAnalyticsRepository();

      const result = await repo.getMilestones(new Date(), new Date());

      expect(result.totalWeddings).toBe(0);
      expect(result.milestones).toBeDefined();
    });
  });

  describe("getTimeline", () => {
    it("should aggregate timeline data by day", async () => {
      // Order: query(wedders), query(weddings), query(onboarding), query(wedder_answers)
      mockQuery
        .mockResolvedValueOnce([
          { created_at: "2024-01-01T10:00:00Z" },
          { created_at: "2024-01-01T14:00:00Z" },
          { created_at: "2024-01-02T09:00:00Z" },
        ]) // wedders (registrations)
        .mockResolvedValueOnce([
          { created_at: "2024-01-01T11:00:00Z" },
          { created_at: "2024-01-02T10:00:00Z" },
        ]) // weddings
        .mockResolvedValueOnce([
          { completed_at: "2024-01-01T12:00:00Z" },
        ]) // onboarding_sessions
        .mockResolvedValueOnce([
          { answered_at: "2024-01-01T13:00:00Z" },
        ]); // wedder_answers (tutorial)

      const repo = new PgJourneyAnalyticsRepository();

      const result = await repo.getTimeline(new Date("2024-01-01"), new Date("2024-01-31"));

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.totals).toBeDefined();
      expect(result.totals.registrations).toBe(3);
      expect(result.totals.weddingsCreated).toBe(2);
    });

    it("should handle empty timeline data", async () => {
      mockQuery
        .mockResolvedValueOnce([]) // wedders
        .mockResolvedValueOnce([]) // weddings
        .mockResolvedValueOnce([]) // onboarding_sessions
        .mockResolvedValueOnce([]); // wedder_answers

      const repo = new PgJourneyAnalyticsRepository();

      const result = await repo.getTimeline(new Date(), new Date());

      expect(result.totals.registrations).toBe(0);
      expect(result.totals.weddingsCreated).toBe(0);
      expect(result.totals.onboardingCompleted).toBe(0);
      expect(result.totals.tutorialCompleted).toBe(0);
    });
  });
});
