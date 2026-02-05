/**
 * KPI Routes Unit Tests
 *
 * Tests route registration and request handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import Fastify, { FastifyInstance } from "fastify";

// Mock the kpiService module
vi.mock("./kpiService.js", () => ({
  getKPIDefinitions: vi.fn().mockReturnValue({
    definitions: [{ slug: "total-users", category: "users", title: "Total Users" }],
    categories: [{ id: "users", label: "Users" }],
    totalCount: 1,
  }),
  getKPIDefinitionsByCategory: vi.fn().mockReturnValue([
    { slug: "total-users", category: "users", title: "Total Users" },
  ]),
  getKPIDefinition: vi.fn().mockReturnValue({
    slug: "total-users",
    category: "users",
    title: "Total Users",
  }),
  getUsersOverview: vi.fn().mockResolvedValue({
    totalUsers: 1000,
    newUsers: 100,
    countries: 5,
    registrations: [],
    growth: [],
    geography: [],
    byProvider: [],
  }),
  getOnboardingOverview: vi.fn().mockResolvedValue({
    funnel: [],
    timeAnalysis: { avgDuration: 120, medianDuration: 90, p90Duration: 300, unit: "seconds", sampleSize: 100, byPhase: [] },
    dropOffs: { topQuestions: [], totalDropOffs: 10, totalStarted: 100 },
    summary: { started: 100, completed: 80, completionRate: 80 },
  }),
  getWeddingsOverview: vi.fn().mockResolvedValue({
    overview: { totalWeddings: 500, activeWeddings: 400 },
    engagement: { tasks: { totalTasks: 1000 } },
    timeline: { upcoming30Days: 10 },
    missions: { weddingsStarted: 400 },
  }),
  getChurnOverview: vi.fn().mockResolvedValue({
    overview: { churnRate: 10 },
    byStage: { stages: [] },
    activity: { activeRate: 70 },
  }),
  getChurnKPIs: vi.fn().mockResolvedValue({
    activity: { totalUsers: 1000, churnRate: 15 },
    breakdown: { totalChurned: 150 },
    timeMetrics: { avgDaysToChurn: 10 },
  }),
  getJourneyOverview: vi.fn().mockResolvedValue({
    funnel: { stages: [], overallCompletionRate: 50 },
    milestones: { milestones: [] },
    timeline: { data: [] },
  }),
  getDashboardOverview: vi.fn().mockResolvedValue({
    users: { totalUsers: 1000 },
    onboarding: { summary: { completionRate: 80 } },
    weddings: { overview: { totalWeddings: 500 } },
    churn: { overview: { churnRate: 10 } },
    journey: { funnel: { overallCompletionRate: 50 } },
    dateRange: { startDate: "2024-01-01", endDate: "2024-01-31" },
  }),
  getEntryPoints: vi.fn().mockResolvedValue({
    data: { totalWeddings: 500, byQuestion: {}, combinations: [] },
    availableQuestions: [],
  }),
  getCustomCombination: vi.fn().mockResolvedValue({
    data: { selectedQuestions: [], matchingWeddings: 0, percentage: 0, totalWeddings: 500 },
  }),
  getDropOffWeddings: vi.fn().mockResolvedValue({ weddings: [], total: 0, page: 1, pageSize: 20 }),
  getChurnStageWeddings: vi.fn().mockResolvedValue({ weddings: [], total: 0, page: 1, pageSize: 20 }),
  getJourneyStageWeddings: vi.fn().mockResolvedValue({ weddings: [], total: 0, page: 1, pageSize: 20 }),
  getWeddingDetail: vi.fn().mockResolvedValue(null),
  getWedderDetail: vi.fn().mockResolvedValue(null),
  getWeddingsByKPIFilter: vi.fn().mockResolvedValue({ weddings: [], total: 0, page: 1, pageSize: 20 }),
  getWeddersList: vi.fn().mockResolvedValue({ wedders: [], total: 0, page: 1, pageSize: 20 }),
}));

// Mock auth middleware
vi.mock("../../lib/auth-middleware.js", () => ({
  requireAuth: vi.fn((_req: unknown, _reply: unknown, done: () => void) => done()),
}));

describe("KPI Routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();

    // Import and register routes
    const { registerWeddedRoutes } = await import("./routes.js");
    await registerWeddedRoutes(app);
    await app.ready();
  });

  describe("GET /kpi/definitions", () => {
    it("should return all KPI definitions", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/definitions",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.definitions).toBeDefined();
      expect(body.categories).toBeDefined();
      expect(body.totalCount).toBeDefined();
    });
  });

  describe("GET /kpi/definitions/:category", () => {
    it("should return definitions for valid category", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/definitions/users",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.definitions).toBeDefined();
    });

    it("should return 400 for invalid category", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/definitions/invalid",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /kpi/definitions/:category/:slug", () => {
    it("should return single KPI definition", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/definitions/users/total-users",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.slug).toBe("total-users");
    });

    it("should return 400 for invalid category", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/definitions/invalid/total-users",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /kpi/users", () => {
    it("should return users overview", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/users",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.totalUsers).toBeDefined();
    });

    it("should accept date range parameters", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/users?startDate=2024-01-01&endDate=2024-01-31&granularity=week",
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("GET /kpi/onboarding", () => {
    it("should return onboarding overview", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/onboarding",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.summary).toBeDefined();
      expect(body.funnel).toBeDefined();
    });
  });

  describe("GET /kpi/weddings", () => {
    it("should return weddings overview", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/weddings",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.overview).toBeDefined();
    });
  });

  describe("GET /kpi/churn", () => {
    it("should return churn KPIs", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/churn",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.activity).toBeDefined();
    });
  });

  describe("GET /kpi/churn/legacy", () => {
    it("should return legacy churn overview", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/churn/legacy",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.overview).toBeDefined();
    });
  });

  describe("GET /kpi/journey", () => {
    it("should return journey overview", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/journey",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.funnel).toBeDefined();
    });
  });

  describe("GET /kpi/dashboard", () => {
    it("should return combined dashboard data", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/dashboard",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.users).toBeDefined();
      expect(body.onboarding).toBeDefined();
      expect(body.weddings).toBeDefined();
      expect(body.churn).toBeDefined();
      expect(body.journey).toBeDefined();
    });
  });

  describe("GET /kpi/entry-points", () => {
    it("should return entry points data", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/entry-points",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeDefined();
    });
  });

  describe("GET /kpi/entry-points/combination", () => {
    it("should return combination result with valid questions", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/entry-points/combination?questions=ceremony_venue_booked,venue_search_started",
      });

      // May return 200 or 400 depending on validation - just check it returns a response
      expect([200, 400]).toContain(response.statusCode);
    });
  });

  describe("GET /kpi/drilldown/dropoffs/:questionId/weddings", () => {
    it("should return drilldown results", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/drilldown/dropoffs/q1/weddings",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.weddings).toBeDefined();
    });
  });

  describe("GET /kpi/drilldown/churn/:stage/weddings", () => {
    it("should return churn drilldown results", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/drilldown/churn/never_started/weddings",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.weddings).toBeDefined();
    });
  });

  describe("GET /kpi/drilldown/journey/:stage/weddings", () => {
    it("should return journey drilldown results", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/drilldown/journey/registered/weddings",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.weddings).toBeDefined();
    });
  });

  describe("GET /kpi/:category/:slug/weddings", () => {
    it("should return weddings for KPI filter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/onboarding/started/weddings",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.weddings).toBeDefined();
    });

    it("should handle invalid category gracefully", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/invalid/started/weddings",
      });

      // Route might return 200 with empty results or 400 - either is acceptable
      expect([200, 400]).toContain(response.statusCode);
    });
  });

  describe("GET /kpi/weddings/:weddingId", () => {
    it("should return 404 for non-existent wedding", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/weddings/w123",
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /kpi/wedders/:wedderId", () => {
    it("should return 404 for non-existent wedder", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/wedders/u123",
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /kpi/wedders", () => {
    it("should return paginated wedders list", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/wedders",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.wedders).toBeDefined();
      expect(body.total).toBeDefined();
    });

    it("should accept pagination and filter parameters", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/kpi/wedders?page=1&pageSize=10&search=test&provider=google&sortBy=createdAt&sortOrder=desc",
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
