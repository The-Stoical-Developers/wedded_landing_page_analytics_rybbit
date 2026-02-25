/**
 * Wedding Entry Points Repository Unit Tests
 *
 * Tests entry point analysis and custom combination counting.
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

// Mock the EntryPointQuestions module
vi.mock("../EntryPointQuestions.js", () => ({
  AVAILABLE_ENTRY_POINT_QUESTIONS: [
    { id: "ceremony_venue_booked", label: "Ceremony Venue", bookedResponse: "yes_booked" },
    { id: "photographer_booked", label: "Photographer", bookedResponse: "yes_booked" },
  ],
  DEFAULT_ENTRY_POINT_QUESTION_IDS: ["ceremony_venue_booked", "photographer_booked"],
  getQuestionsByIds: (ids: string[]) => {
    const questions = [
      { id: "ceremony_venue_booked", label: "Ceremony Venue", bookedResponse: "yes_booked" },
      { id: "photographer_booked", label: "Photographer", bookedResponse: "yes_booked" },
    ];
    return questions.filter(q => ids.includes(q.id));
  },
}));

// Import AFTER mock setup
import { PgWeddingEntryPointsRepository } from "./WeddingEntryPointsRepository.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PgWeddingEntryPointsRepository", () => {
  describe("getEntryPoints", () => {
    it("should aggregate entry points by question", async () => {
      // 1st query: weddings
      mockQuery.mockResolvedValueOnce([{ id: "w1" }, { id: "w2" }, { id: "w3" }]);
      // 2nd query: answers
      mockQuery.mockResolvedValueOnce([
        { wedding_id: "w1", question_id: "ceremony_venue_booked", selected_response_ids: ["yes_booked"] },
        { wedding_id: "w2", question_id: "ceremony_venue_booked", selected_response_ids: ["no"] },
        { wedding_id: "w1", question_id: "photographer_booked", selected_response_ids: ["yes_booked"] },
      ]);

      const repo = new PgWeddingEntryPointsRepository();

      const result = await repo.getEntryPoints(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.data.totalWeddings).toBe(3);
      expect(result.data.byQuestion).toBeDefined();
      expect(result.data.combinations).toBeDefined();
      expect(result.availableQuestions).toBeDefined();
    });

    it("should handle empty data", async () => {
      // No weddings
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgWeddingEntryPointsRepository();

      const result = await repo.getEntryPoints(new Date(), new Date());

      expect(result.data.totalWeddings).toBe(0);
      expect(result.data.combinations).toBeDefined();
    });

    it("should throw on database error", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Query timeout"));

      const repo = new PgWeddingEntryPointsRepository();

      await expect(repo.getEntryPoints(new Date(), new Date())).rejects.toThrow("Query timeout");
    });
  });

  describe("getCustomCombinationCount", () => {
    it("should count custom/unique combinations", async () => {
      // 1st query: weddings
      mockQuery.mockResolvedValueOnce([{ id: "w1" }, { id: "w2" }, { id: "w3" }, { id: "w4" }]);
      // 2nd query: answers
      mockQuery.mockResolvedValueOnce([
        { wedding_id: "w1", question_id: "ceremony_venue_booked", selected_response_ids: ["yes_booked"] },
        { wedding_id: "w1", question_id: "photographer_booked", selected_response_ids: ["yes_booked"] },
        { wedding_id: "w2", question_id: "ceremony_venue_booked", selected_response_ids: ["yes_booked"] },
        { wedding_id: "w2", question_id: "photographer_booked", selected_response_ids: ["yes_booked"] },
      ]);

      const repo = new PgWeddingEntryPointsRepository();

      const result = await repo.getCustomCombinationCount(
        new Date(),
        new Date(),
        ["ceremony_venue_booked", "photographer_booked"]
      );

      expect(result).toBeDefined();
      expect(result.totalWeddings).toBe(4);
      expect(result.matchingWeddings).toBe(2); // w1 and w2 have both booked
      expect(result.percentage).toBe(50); // 2/4 = 50%
    });

    it("should handle no matching combinations", async () => {
      // 1st query: weddings
      mockQuery.mockResolvedValueOnce([{ id: "w1" }, { id: "w2" }]);
      // 2nd query: answers - only one question answered per wedding, not both
      mockQuery.mockResolvedValueOnce([
        { wedding_id: "w1", question_id: "ceremony_venue_booked", selected_response_ids: ["yes_booked"] },
        { wedding_id: "w2", question_id: "photographer_booked", selected_response_ids: ["yes_booked"] },
      ]);

      const repo = new PgWeddingEntryPointsRepository();

      const result = await repo.getCustomCombinationCount(
        new Date(),
        new Date(),
        ["ceremony_venue_booked", "photographer_booked"]
      );

      expect(result.matchingWeddings).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it("should handle empty data", async () => {
      // No weddings
      mockQuery.mockResolvedValueOnce([]);

      const repo = new PgWeddingEntryPointsRepository();

      const result = await repo.getCustomCombinationCount(
        new Date(),
        new Date(),
        ["ceremony_venue_booked"]
      );

      expect(result.totalWeddings).toBe(0);
      expect(result.matchingWeddings).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });
});
