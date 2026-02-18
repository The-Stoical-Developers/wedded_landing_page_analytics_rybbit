/**
 * Wedding Analytics Repository Unit Tests
 *
 * Tests wedding overview and engagement metrics aggregation.
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

import { PgWeddingAnalyticsRepository } from "./WeddingAnalyticsRepository.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PgWeddingAnalyticsRepository", () => {
  describe("getOverview", () => {
    it("should calculate wedding overview correctly", async () => {
      // 5 queryCount calls in order:
      // 1. total weddings
      // 2. active weddings
      // 3. with partner
      // 4. with ceremony date set
      // 5. with celebration date set
      mockQueryCount
        .mockResolvedValueOnce(100)  // total weddings
        .mockResolvedValueOnce(80)   // active weddings
        .mockResolvedValueOnce(60)   // with partner
        .mockResolvedValueOnce(50)   // with ceremony date set
        .mockResolvedValueOnce(45);  // with celebration date set

      const repo = new PgWeddingAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.totalWeddings).toBe(100);
      expect(result.activeWeddings).toBe(80);
      expect(result.archivedWeddings).toBe(20); // 100 - 80
      expect(result.withPartner).toBe(60);
      expect(result.soloPlanning).toBe(40); // 100 - 60
      expect(result.withCeremonyDateSet).toBe(50);
      expect(result.withoutCeremonyDate).toBe(50); // 100 - 50
      expect(result.withCelebrationDateSet).toBe(45);
      expect(result.withoutCelebrationDate).toBe(55); // 100 - 45
      expect(result.partnerJoinRate).toBe(60); // 60/100 * 100
      expect(result.ceremonyDateSetRate).toBe(50); // 50/100 * 100
      expect(result.celebrationDateSetRate).toBe(45); // 45/100 * 100
    });

    it("should handle empty weddings data", async () => {
      mockQueryCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const repo = new PgWeddingAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.totalWeddings).toBe(0);
      expect(result.activeWeddings).toBe(0);
      expect(result.partnerJoinRate).toBe(0);
      expect(result.ceremonyDateSetRate).toBe(0);
      expect(result.celebrationDateSetRate).toBe(0);
    });

    it("should handle null data", async () => {
      mockQueryCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const repo = new PgWeddingAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.totalWeddings).toBe(0);
    });

    it("should throw on database error", async () => {
      mockQueryCount.mockRejectedValueOnce(new Error("Database error"));

      const repo = new PgWeddingAnalyticsRepository();

      await expect(repo.getOverview(new Date(), new Date())).rejects.toThrow("Database error");
    });
  });

  describe("getEngagement", () => {
    it("should calculate engagement metrics correctly", async () => {
      // Order of calls in getEngagement:
      // 1. queryCount: weddings count
      // 2. queryCount: tasks total
      // 3. queryCount: tasks completed
      // 4. queryCount: vendors total
      // 5. queryCount: vendors saved
      // 6. queryCount: vendors contacted
      // 7. queryCount: vendors hired
      // 8. query: tasks data (wedding_ids)
      // 9. query: vendors data (wedding_ids)
      // 10. query: onboarding data (wedding_ids)
      mockQueryCount
        .mockResolvedValueOnce(100)  // weddings count
        .mockResolvedValueOnce(500)  // tasks total
        .mockResolvedValueOnce(300)  // tasks completed
        .mockResolvedValueOnce(200)  // vendors total
        .mockResolvedValueOnce(100)  // vendors saved
        .mockResolvedValueOnce(60)   // vendors contacted
        .mockResolvedValueOnce(40);  // vendors hired

      mockQuery
        .mockResolvedValueOnce([{ wedding_id: "w1" }, { wedding_id: "w2" }])  // tasks data
        .mockResolvedValueOnce([{ wedding_id: "w1" }, { wedding_id: "w3" }])  // vendors data
        .mockResolvedValueOnce([{ wedding_id: "w1" }]);  // onboarding data

      const repo = new PgWeddingAnalyticsRepository();

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
      mockQueryCount
        .mockResolvedValueOnce(0)   // weddings count
        .mockResolvedValueOnce(0)   // tasks total
        .mockResolvedValueOnce(0)   // tasks completed
        .mockResolvedValueOnce(0)   // vendors total
        .mockResolvedValueOnce(0)   // vendors saved
        .mockResolvedValueOnce(0)   // vendors contacted
        .mockResolvedValueOnce(0);  // vendors hired

      mockQuery
        .mockResolvedValueOnce([])  // tasks data
        .mockResolvedValueOnce([])  // vendors data
        .mockResolvedValueOnce([]); // onboarding data

      const repo = new PgWeddingAnalyticsRepository();

      const result = await repo.getEngagement(new Date(), new Date());

      expect(result.tasks.totalTasks).toBe(0);
      expect(result.tasks.taskCompletionRate).toBe(0);
      expect(result.avgTasksPerWedding).toBe(0);
      expect(result.avgVendorsPerWedding).toBe(0);
    });

    it("should calculate vendor conversion rate", async () => {
      mockQueryCount
        .mockResolvedValueOnce(50)   // weddings count
        .mockResolvedValueOnce(100)  // tasks total
        .mockResolvedValueOnce(50)   // tasks completed
        .mockResolvedValueOnce(100)  // vendors total
        .mockResolvedValueOnce(40)   // vendors saved
        .mockResolvedValueOnce(35)   // vendors contacted
        .mockResolvedValueOnce(25);  // vendors hired

      mockQuery
        .mockResolvedValueOnce([{ wedding_id: "w1" }])  // tasks data
        .mockResolvedValueOnce([{ wedding_id: "w1" }])  // vendors data
        .mockResolvedValueOnce([]);  // onboarding data

      const repo = new PgWeddingAnalyticsRepository();

      const result = await repo.getEngagement(new Date(), new Date());

      expect(result.vendors.totalVendors).toBe(100);
      expect(result.vendors.savedVendors).toBe(40);
      expect(result.vendors.contactedVendors).toBe(35);
      expect(result.vendors.hiredVendors).toBe(25);
      expect(result.vendors.conversionRate).toBe(25); // 25/100 * 100
    });
  });

  describe("getTimeline", () => {
    it("should calculate timeline metrics correctly", async () => {
      // Order: queryCount(upcoming30Days), queryCount(pastCeremony), query(sameDayData)
      mockQueryCount
        .mockResolvedValueOnce(15)   // upcoming30Days
        .mockResolvedValueOnce(25);  // pastCeremony

      mockQuery.mockResolvedValueOnce([
        { id: "1", wedding_date: "2024-06-15", engagement_date: "2024-06-15" }, // same day
        { id: "2", wedding_date: "2024-06-15", engagement_date: "2024-06-15" }, // same day
        { id: "3", wedding_date: "2024-06-15", engagement_date: "2024-06-16" }, // multi day
      ]);

      const repo = new PgWeddingAnalyticsRepository();

      const result = await repo.getTimeline();

      expect(result.upcoming30Days).toBe(15);
      expect(result.pastCeremony).toBe(25);
      expect(result.sameDayEvents).toBe(2);
      expect(result.multiDayEvents).toBe(1);
    });

    it("should handle empty timeline data", async () => {
      mockQueryCount
        .mockResolvedValueOnce(0)   // upcoming30Days
        .mockResolvedValueOnce(0);  // pastCeremony

      mockQuery.mockResolvedValueOnce([]);  // sameDayData

      const repo = new PgWeddingAnalyticsRepository();

      const result = await repo.getTimeline();

      expect(result.upcoming30Days).toBe(0);
      expect(result.pastCeremony).toBe(0);
      expect(result.sameDayEvents).toBe(0);
      expect(result.multiDayEvents).toBe(0);
    });
  });

  describe("getMissions", () => {
    it("should calculate mission metrics correctly", async () => {
      // Order: query(missionsStarted), query(missionsCompleted), query(ceremony), query(celebration)
      mockQuery
        .mockResolvedValueOnce([
          { wedding_id: "w1" },
          { wedding_id: "w2" },
          { wedding_id: "w1" }, // duplicate should be counted once
        ])  // missions started
        .mockResolvedValueOnce([
          { wedding_id: "w1" },
          { wedding_id: "w3" },
        ])  // missions completed
        .mockResolvedValueOnce([
          { wedding_id: "w1" },
        ])  // ceremony venue
        .mockResolvedValueOnce([
          { wedding_id: "w2" },
          { wedding_id: "w3" },
        ]); // celebration venue

      const repo = new PgWeddingAnalyticsRepository();

      const result = await repo.getMissions(new Date(), new Date());

      expect(result.weddingsStarted).toBe(2); // w1, w2 (deduplicated)
      expect(result.weddingsCompleted).toBe(2); // w1, w3
      expect(result.ceremonyVenueBooked).toBe(1); // w1
      expect(result.celebrationVenueBooked).toBe(2); // w2, w3
    });

    it("should handle empty missions data", async () => {
      mockQuery
        .mockResolvedValueOnce([])  // missions started
        .mockResolvedValueOnce([])  // missions completed
        .mockResolvedValueOnce([])  // ceremony venue
        .mockResolvedValueOnce([]); // celebration venue

      const repo = new PgWeddingAnalyticsRepository();

      const result = await repo.getMissions(new Date(), new Date());

      expect(result.weddingsStarted).toBe(0);
      expect(result.weddingsCompleted).toBe(0);
      expect(result.ceremonyVenueBooked).toBe(0);
      expect(result.celebrationVenueBooked).toBe(0);
    });
  });
});
