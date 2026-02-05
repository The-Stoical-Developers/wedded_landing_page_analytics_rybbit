/**
 * Wedding Analytics Repository Unit Tests
 *
 * Tests wedding overview and engagement metrics aggregation.
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

describe("SupabaseWeddingAnalyticsRepository", () => {
  describe("getOverview", () => {
    it("should calculate wedding overview correctly", async () => {
      // Mock results for each query in sequence
      const mockResults = [
        { count: 100, data: null, error: null }, // total weddings
        { count: 80, data: null, error: null },  // active weddings
        { count: 60, data: null, error: null },  // with partner
        { count: 50, data: null, error: null },  // with ceremony date set
        { count: 45, data: null, error: null },  // with celebration date set
      ];

      let callIndex = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => {
              const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
              callIndex++;
              return result;
            }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => {
                const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                callIndex++;
                return result;
              }),
            })),
          })),
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => {
                const result = mockResults[callIndex] || mockResults[mockResults.length - 1];
                callIndex++;
                return result;
              }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

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
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.totalWeddings).toBe(0);
      expect(result.activeWeddings).toBe(0);
      expect(result.partnerJoinRate).toBe(0);
      expect(result.ceremonyDateSetRate).toBe(0);
      expect(result.celebrationDateSetRate).toBe(0);
    });

    it("should handle null data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: null, data: null, error: null }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: null, data: null, error: null }),
            })),
          })),
          not: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: null, data: null, error: null }),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getOverview(new Date(), new Date());

      expect(result.totalWeddings).toBe(0);
    });

    it("should throw on database error", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: null, data: null, error: new Error("Database error") }),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      await expect(repo.getOverview(new Date(), new Date())).rejects.toThrow("Database error");
    });
  });

  describe("getEngagement", () => {
    it("should calculate engagement metrics correctly", async () => {
      // All queries in execution order:
      // 1. weddings count: gte().lte()
      // 2. tasks total count: gte().lte()
      // 3. tasks completed count: eq().gte().lte()
      // 4. vendors total count: is().gte().lte() (COUNT)
      // 5. vendors saved count: eq().is().gte().lte()
      // 6. vendors contacted count: eq().is().gte().lte()
      // 7. vendors hired count: eq().is().gte().lte()
      // 8. tasks data: is().gte().lte() (DATA)
      // 9. vendors data: is().gte().lte() (DATA)
      // 10. onboarding data: not().gte().lte() (DATA)

      let queryIndex = 0;
      const allResults = [
        { count: 100, data: null, error: null }, // 0: weddings count
        { count: 500, data: null, error: null }, // 1: tasks total
        { count: 300, data: null, error: null }, // 2: tasks completed
        { count: 200, data: null, error: null }, // 3: vendors total (is path)
        { count: 100, data: null, error: null }, // 4: vendors saved
        { count: 60, data: null, error: null },  // 5: vendors contacted
        { count: 40, data: null, error: null },  // 6: vendors hired
        { data: [{ wedding_id: "w1" }, { wedding_id: "w2" }], error: null }, // 7: tasks data
        { data: [{ wedding_id: "w1" }, { wedding_id: "w3" }], error: null }, // 8: vendors data
        { data: [{ wedding_id: "w1" }], error: null }, // 9: onboarding data
      ];

      const getNextResult = () => {
        const result = allResults[queryIndex] || allResults[allResults.length - 1];
        queryIndex++;
        return result;
      };

      const createQueryChain = () => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockImplementation(() => getNextResult());
        chain.eq = vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => getNextResult()),
          })),
          is: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => getNextResult()),
            })),
          })),
        }));
        chain.is = vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => getNextResult()),
          })),
        }));
        chain.not = vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => getNextResult()),
          })),
        }));
        return chain;
      };

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => createQueryChain()),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

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
      const createZeroChain = () => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockReturnValue({ count: 0, data: null, error: null });
        chain.eq = vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
          })),
          is: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
        }));
        chain.is = vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ data: [], error: null }),
          })),
        }));
        chain.not = vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ data: [], error: null }),
          })),
        }));
        return chain;
      };

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => createZeroChain()),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getEngagement(new Date(), new Date());

      expect(result.tasks.totalTasks).toBe(0);
      expect(result.tasks.taskCompletionRate).toBe(0);
      expect(result.avgTasksPerWedding).toBe(0);
      expect(result.avgVendorsPerWedding).toBe(0);
    });

    it("should calculate vendor conversion rate", async () => {
      // All queries in execution order (same as main test but with different values)
      let queryIndex = 0;
      const allResults = [
        { count: 50, data: null, error: null },  // 0: weddings count
        { count: 100, data: null, error: null }, // 1: tasks total
        { count: 50, data: null, error: null },  // 2: tasks completed
        { count: 100, data: null, error: null }, // 3: vendors total (is path)
        { count: 40, data: null, error: null },  // 4: vendors saved
        { count: 35, data: null, error: null },  // 5: vendors contacted
        { count: 25, data: null, error: null },  // 6: vendors hired
        { data: [{ wedding_id: "w1" }], error: null }, // 7: tasks data
        { data: [{ wedding_id: "w1" }], error: null }, // 8: vendors data
        { data: [], error: null }, // 9: onboarding data
      ];

      const getNextResult = () => {
        const result = allResults[queryIndex] || allResults[allResults.length - 1];
        queryIndex++;
        return result;
      };

      const createQueryChain = () => {
        const chain: Record<string, ReturnType<typeof vi.fn>> = {};
        chain.gte = vi.fn().mockImplementation(() => chain);
        chain.lte = vi.fn().mockImplementation(() => getNextResult());
        chain.eq = vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => getNextResult()),
          })),
          is: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockImplementation(() => getNextResult()),
            })),
          })),
        }));
        chain.is = vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => getNextResult()),
          })),
        }));
        chain.not = vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => getNextResult()),
          })),
        }));
        return chain;
      };

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => createQueryChain()),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

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
      // Mock for upcoming30Days query
      const mockUpcoming = { count: 15, data: null, error: null };
      // Mock for pastCeremony query
      const mockPast = { count: 25, data: null, error: null };
      // Mock for same-day and multi-day queries
      const mockDatesData = {
        data: [
          { id: "1", ceremony_date: "2024-06-15", celebration_date: "2024-06-15" }, // same day
          { id: "2", ceremony_date: "2024-06-15", celebration_date: "2024-06-15" }, // same day
          { id: "3", ceremony_date: "2024-06-15", celebration_date: "2024-06-16" }, // multi day
        ],
        error: null,
      };

      let callIndex = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === "weddings") {
          return {
            select: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => ({
                  eq: vi.fn().mockReturnValue(mockUpcoming),
                })),
              })),
              lt: vi.fn().mockImplementation(() => ({
                not: vi.fn().mockReturnValue(mockPast),
              })),
              not: vi.fn().mockImplementation(() => ({
                not: vi.fn().mockReturnValue(mockDatesData),
              })),
            })),
          };
        }
        return {
          select: vi.fn().mockReturnValue({ data: [], error: null }),
        };
      });

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getTimeline();

      expect(result.upcoming30Days).toBe(15);
      expect(result.pastCeremony).toBe(25);
      expect(result.sameDayEvents).toBe(2);
      expect(result.multiDayEvents).toBe(1);
    });

    it("should handle empty timeline data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
            })),
          })),
          lt: vi.fn().mockImplementation(() => ({
            not: vi.fn().mockReturnValue({ count: 0, data: null, error: null }),
          })),
          not: vi.fn().mockImplementation(() => ({
            not: vi.fn().mockReturnValue({ data: [], error: null }),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getTimeline();

      expect(result.upcoming30Days).toBe(0);
      expect(result.pastCeremony).toBe(0);
      expect(result.sameDayEvents).toBe(0);
      expect(result.multiDayEvents).toBe(0);
    });
  });

  describe("getMissions", () => {
    it("should calculate mission metrics correctly", async () => {
      // Mock missions data
      const mockMissionsStarted = {
        data: [
          { wedding_id: "w1" },
          { wedding_id: "w2" },
          { wedding_id: "w1" }, // duplicate should be counted once
        ],
        error: null,
      };
      const mockMissionsCompleted = {
        data: [
          { wedding_id: "w1" },
          { wedding_id: "w3" },
        ],
        error: null,
      };
      const mockCeremonyVenue = {
        data: [{ wedding_id: "w1" }],
        error: null,
      };
      const mockCelebrationVenue = {
        data: [{ wedding_id: "w2" }, { wedding_id: "w3" }],
        error: null,
      };

      let queryCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === "missions") {
          return {
            select: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => {
                  queryCount++;
                  return mockMissionsStarted;
                }),
              })),
              eq: vi.fn().mockImplementation((field: string, value: string) => {
                if (field === "status" && value === "COMPLETED") {
                  return {
                    gte: vi.fn().mockImplementation(() => ({
                      lte: vi.fn().mockReturnValue(mockMissionsCompleted),
                    })),
                  };
                }
                if (field === "template_id" && value === "CEREMONY_VENUE") {
                  return {
                    eq: vi.fn().mockImplementation(() => ({
                      gte: vi.fn().mockImplementation(() => ({
                        lte: vi.fn().mockReturnValue(mockCeremonyVenue),
                      })),
                    })),
                  };
                }
                if (field === "template_id" && value === "CELEBRATION_VENUE") {
                  return {
                    eq: vi.fn().mockImplementation(() => ({
                      gte: vi.fn().mockImplementation(() => ({
                        lte: vi.fn().mockReturnValue(mockCelebrationVenue),
                      })),
                    })),
                  };
                }
                return {
                  eq: vi.fn().mockImplementation(() => ({
                    gte: vi.fn().mockImplementation(() => ({
                      lte: vi.fn().mockReturnValue({ data: [], error: null }),
                    })),
                  })),
                };
              }),
            })),
          };
        }
        return {
          select: vi.fn().mockReturnValue({ data: [], error: null }),
        };
      });

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getMissions(new Date(), new Date());

      expect(result.weddingsStarted).toBe(2); // w1, w2 (deduplicated)
      expect(result.weddingsCompleted).toBe(2); // w1, w3
      expect(result.ceremonyVenueBooked).toBe(1); // w1
      expect(result.celebrationVenueBooked).toBe(2); // w2, w3
    });

    it("should handle empty missions data", async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          gte: vi.fn().mockImplementation(() => ({
            lte: vi.fn().mockReturnValue({ data: [], error: null }),
          })),
          eq: vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
              lte: vi.fn().mockReturnValue({ data: [], error: null }),
            })),
            eq: vi.fn().mockImplementation(() => ({
              gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockReturnValue({ data: [], error: null }),
              })),
            })),
          })),
        })),
      }));

      const { SupabaseWeddingAnalyticsRepository } = await import("./WeddingAnalyticsRepository.js");
      const repo = new SupabaseWeddingAnalyticsRepository();

      const result = await repo.getMissions(new Date(), new Date());

      expect(result.weddingsStarted).toBe(0);
      expect(result.weddingsCompleted).toBe(0);
      expect(result.ceremonyVenueBooked).toBe(0);
      expect(result.celebrationVenueBooked).toBe(0);
    });
  });
});
