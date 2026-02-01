/**
 * Wedding Entry Points Repository Unit Tests
 *
 * Tests entry point analysis and custom combination counting.
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SupabaseWeddingEntryPointsRepository", () => {
  describe("getEntryPoints", () => {
    it("should aggregate entry points by question", async () => {
      // Mock weddings and answers
      mockFrom.mockImplementation((tableName: string) => {
        if (tableName === "weddings") {
          return {
            select: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => ({
                  eq: vi.fn().mockReturnValue({
                    data: [{ id: "w1" }, { id: "w2" }, { id: "w3" }],
                    error: null,
                  }),
                })),
              })),
            })),
          };
        }
        // wedder_answers table
        return {
          select: vi.fn().mockImplementation(() => ({
            in: vi.fn().mockImplementation(() => ({
              in: vi.fn().mockImplementation(() => ({
                is: vi.fn().mockReturnValue({
                  data: [
                    { wedding_id: "w1", question_id: "ceremony_venue_booked", selected_response_ids: ["yes_booked"] },
                    { wedding_id: "w2", question_id: "ceremony_venue_booked", selected_response_ids: ["no"] },
                    { wedding_id: "w1", question_id: "photographer_booked", selected_response_ids: ["yes_booked"] },
                  ],
                  error: null,
                }),
              })),
            })),
          })),
        };
      });

      const { SupabaseWeddingEntryPointsRepository } = await import("./WeddingEntryPointsRepository.js");
      const repo = new SupabaseWeddingEntryPointsRepository();

      const result = await repo.getEntryPoints(new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.data.totalWeddings).toBe(3);
      expect(result.data.byQuestion).toBeDefined();
      expect(result.data.combinations).toBeDefined();
      expect(result.availableQuestions).toBeDefined();
    });

    it("should handle empty data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockReturnValue({
                data: [],
                error: null,
              }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingEntryPointsRepository } = await import("./WeddingEntryPointsRepository.js");
      const repo = new SupabaseWeddingEntryPointsRepository();

      const result = await repo.getEntryPoints(new Date(), new Date());

      expect(result.data.totalWeddings).toBe(0);
      expect(result.data.combinations).toBeDefined();
    });

    it("should throw on database error", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockReturnValue({
                data: null,
                error: new Error("Query timeout"),
              }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingEntryPointsRepository } = await import("./WeddingEntryPointsRepository.js");
      const repo = new SupabaseWeddingEntryPointsRepository();

      await expect(repo.getEntryPoints(new Date(), new Date())).rejects.toThrow("Query timeout");
    });
  });

  describe("getCustomCombinationCount", () => {
    it("should count custom/unique combinations", async () => {
      mockFrom.mockImplementation((tableName: string) => {
        if (tableName === "weddings") {
          return {
            select: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => ({
                  eq: vi.fn().mockReturnValue({
                    data: [{ id: "w1" }, { id: "w2" }, { id: "w3" }, { id: "w4" }],
                    error: null,
                  }),
                })),
              })),
            })),
          };
        }
        return {
          select: vi.fn().mockImplementation(() => ({
            in: vi.fn().mockImplementation(() => ({
              in: vi.fn().mockImplementation(() => ({
                is: vi.fn().mockReturnValue({
                  data: [
                    { wedding_id: "w1", question_id: "ceremony_venue_booked", selected_response_ids: ["yes_booked"] },
                    { wedding_id: "w1", question_id: "photographer_booked", selected_response_ids: ["yes_booked"] },
                    { wedding_id: "w2", question_id: "ceremony_venue_booked", selected_response_ids: ["yes_booked"] },
                    { wedding_id: "w2", question_id: "photographer_booked", selected_response_ids: ["yes_booked"] },
                  ],
                  error: null,
                }),
              })),
            })),
          })),
        };
      });

      const { SupabaseWeddingEntryPointsRepository } = await import("./WeddingEntryPointsRepository.js");
      const repo = new SupabaseWeddingEntryPointsRepository();

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
      mockFrom.mockImplementation((tableName: string) => {
        if (tableName === "weddings") {
          return {
            select: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => ({
                  eq: vi.fn().mockReturnValue({
                    data: [{ id: "w1" }, { id: "w2" }],
                    error: null,
                  }),
                })),
              })),
            })),
          };
        }
        return {
          select: vi.fn().mockImplementation(() => ({
            in: vi.fn().mockImplementation(() => ({
              in: vi.fn().mockImplementation(() => ({
                is: vi.fn().mockReturnValue({
                  data: [
                    // Only one question answered per wedding, not both
                    { wedding_id: "w1", question_id: "ceremony_venue_booked", selected_response_ids: ["yes_booked"] },
                    { wedding_id: "w2", question_id: "photographer_booked", selected_response_ids: ["yes_booked"] },
                  ],
                  error: null,
                }),
              })),
            })),
          })),
        };
      });

      const { SupabaseWeddingEntryPointsRepository } = await import("./WeddingEntryPointsRepository.js");
      const repo = new SupabaseWeddingEntryPointsRepository();

      const result = await repo.getCustomCombinationCount(
        new Date(),
        new Date(),
        ["ceremony_venue_booked", "photographer_booked"]
      );

      expect(result.matchingWeddings).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it("should handle empty data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockReturnValue({
                data: [],
                error: null,
              }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingEntryPointsRepository } = await import("./WeddingEntryPointsRepository.js");
      const repo = new SupabaseWeddingEntryPointsRepository();

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
