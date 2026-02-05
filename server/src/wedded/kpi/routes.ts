/**
 * Wedded KPI Routes
 *
 * API endpoints for business KPIs. All routes require authentication
 * and organization membership.
 *
 * Endpoints:
 * - GET /api/kpi/definitions - All KPI definitions
 * - GET /api/kpi/definitions/:category - KPIs by category
 * - GET /api/kpi/definitions/:category/:slug - Single KPI definition
 * - GET /api/kpi/users - User analytics
 * - GET /api/kpi/onboarding - Onboarding analytics
 * - GET /api/kpi/weddings - Wedding analytics
 * - GET /api/kpi/churn - Churn analytics
 * - GET /api/kpi/journey - Journey analytics
 * - GET /api/kpi/dashboard - Combined dashboard data
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../lib/auth-middleware.js";
import {
  getKPIDefinitions,
  getKPIDefinitionsByCategory,
  getKPIDefinition,
  getUsersOverview,
  getOnboardingOverview,
  getWeddingsOverview,
  getChurnOverview,
  getChurnKPIs,
  getJourneyOverview,
  getDashboardOverview,
  getEntryPoints,
  getCustomCombination,
  getDropOffWeddings,
  getChurnStageWeddings,
  getJourneyStageWeddings,
  getWeddingDetail,
  getWedderDetail,
  getWeddingsByKPIFilter,
  getWeddersList,
} from "./kpiService.js";
import { KPICategory, CATEGORY_LABELS } from "./KPIDefinitions.js";
import { Granularity } from "./repositories/types.js";

// Query schema for date range
const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  granularity: z.enum(["day", "week", "month"]).optional(),
});

// Default date range: last 30 days
function getDefaultDateRange(): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return { startDate, endDate };
}

// Parse date range from query
function parseDateRange(query: Record<string, unknown>): {
  startDate: Date;
  endDate: Date;
  granularity: Granularity;
} {
  const parsed = dateRangeSchema.parse(query);
  const defaults = getDefaultDateRange();

  return {
    startDate: parsed.startDate ? new Date(parsed.startDate) : defaults.startDate,
    endDate: parsed.endDate ? new Date(parsed.endDate) : defaults.endDate,
    granularity: parsed.granularity || "day",
  };
}

// Validate category
function isValidCategory(category: string): category is KPICategory {
  return category in CATEGORY_LABELS;
}

// Pre-composed middleware
// TODO: Re-enable auth for production
const authOnly = process.env.NODE_ENV === "development"
  ? {}
  : { preHandler: [requireAuth] as any };

/**
 * Register all Wedded KPI routes
 */
export async function registerWeddedRoutes(fastify: FastifyInstance) {
  // ========================================
  // KPI DEFINITIONS
  // ========================================

  // GET /api/kpi/definitions - All KPI definitions
  fastify.get(
    "/kpi/definitions",
    authOnly,
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = getKPIDefinitions();
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching KPI definitions");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/definitions/:category - KPIs by category
  fastify.get(
    "/kpi/definitions/:category",
    authOnly,
    async (
      request: FastifyRequest<{ Params: { category: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { category } = request.params;

        if (!isValidCategory(category)) {
          return reply.status(400).send({
            error: "Invalid category",
            validCategories: Object.keys(CATEGORY_LABELS),
          });
        }

        const definitions = getKPIDefinitionsByCategory(category);
        return reply.send({
          category,
          categoryLabel: CATEGORY_LABELS[category],
          definitions,
          count: definitions.length,
        });
      } catch (error) {
        fastify.log.error(error, "Error fetching KPIs by category");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/definitions/:category/:slug - Single KPI definition
  fastify.get(
    "/kpi/definitions/:category/:slug",
    authOnly,
    async (
      request: FastifyRequest<{ Params: { category: string; slug: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { category, slug } = request.params;

        if (!isValidCategory(category)) {
          return reply.status(400).send({
            error: "Invalid category",
            validCategories: Object.keys(CATEGORY_LABELS),
          });
        }

        const definition = getKPIDefinition(category, slug);

        if (!definition) {
          return reply.status(404).send({ error: "KPI not found" });
        }

        return reply.send(definition);
      } catch (error) {
        fastify.log.error(error, "Error fetching KPI definition");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // ========================================
  // ANALYTICS DATA
  // ========================================

  // GET /api/kpi/users - User analytics
  fastify.get(
    "/kpi/users",
    authOnly,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate, granularity } = parseDateRange(
          request.query as Record<string, unknown>
        );
        const result = await getUsersOverview(startDate, endDate, granularity);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching users overview");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/onboarding - Onboarding analytics
  fastify.get(
    "/kpi/onboarding",
    authOnly,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );
        const result = await getOnboardingOverview(startDate, endDate);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching onboarding overview");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/weddings - Wedding analytics
  fastify.get(
    "/kpi/weddings",
    authOnly,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );
        const result = await getWeddingsOverview(startDate, endDate);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching weddings overview");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/churn - Churn analytics (new activity-based definition)
  fastify.get(
    "/kpi/churn",
    authOnly,
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await getChurnKPIs();
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching churn KPIs");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/churn/legacy - Legacy churn analytics (deprecated)
  fastify.get(
    "/kpi/churn/legacy",
    authOnly,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );
        const result = await getChurnOverview(startDate, endDate);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching legacy churn overview");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/journey - Journey analytics
  fastify.get(
    "/kpi/journey",
    authOnly,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );
        const result = await getJourneyOverview(startDate, endDate);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching journey overview");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/dashboard - Combined dashboard
  fastify.get(
    "/kpi/dashboard",
    authOnly,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate, granularity } = parseDateRange(
          request.query as Record<string, unknown>
        );
        const result = await getDashboardOverview(
          startDate,
          endDate,
          granularity
        );
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching dashboard overview");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // ========================================
  // ENTRY POINTS
  // ========================================

  // GET /api/kpi/entry-points - Wedding entry points analysis
  fastify.get(
    "/kpi/entry-points",
    authOnly,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );

        // Parse questionIds from comma-separated string
        const query = request.query as Record<string, unknown>;
        const questionIdsParam = query.questionIds as string | undefined;
        const questionIds = questionIdsParam
          ? questionIdsParam.split(",").map((id) => id.trim())
          : undefined;

        const result = await getEntryPoints(startDate, endDate, questionIds);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching entry points");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/entry-points/combination - Custom combination count
  fastify.get(
    "/kpi/entry-points/combination",
    authOnly,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );

        // Parse questionIds from comma-separated string (required)
        const query = request.query as Record<string, unknown>;
        const questionIdsParam = query.questionIds as string | undefined;

        if (!questionIdsParam) {
          return reply.status(400).send({
            error: "questionIds parameter is required",
          });
        }

        const questionIds = questionIdsParam.split(",").map((id) => id.trim());
        const result = await getCustomCombination(startDate, endDate, questionIds);
        return reply.send({ data: result });
      } catch (error) {
        fastify.log.error(error, "Error fetching custom combination");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // ========================================
  // DRILL-DOWN ENDPOINTS
  // ========================================

  // GET /api/kpi/drilldown/dropoffs/:questionId/weddings
  fastify.get(
    "/kpi/drilldown/dropoffs/:questionId/weddings",
    authOnly,
    async (
      request: FastifyRequest<{ Params: { questionId: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { questionId } = request.params;
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );

        const query = request.query as Record<string, unknown>;
        const page = parseInt(query.page as string, 10) || 1;
        const pageSize = parseInt(query.pageSize as string, 10) || 20;

        const result = await getDropOffWeddings(
          questionId,
          startDate,
          endDate,
          page,
          pageSize
        );
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching drop-off weddings");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/drilldown/churn/:stage/weddings
  fastify.get(
    "/kpi/drilldown/churn/:stage/weddings",
    authOnly,
    async (
      request: FastifyRequest<{ Params: { stage: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { stage } = request.params;
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );

        const query = request.query as Record<string, unknown>;
        const page = parseInt(query.page as string, 10) || 1;
        const pageSize = parseInt(query.pageSize as string, 10) || 20;

        const result = await getChurnStageWeddings(
          stage,
          startDate,
          endDate,
          page,
          pageSize
        );
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching churn stage weddings");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/drilldown/journey/:stage/weddings
  fastify.get(
    "/kpi/drilldown/journey/:stage/weddings",
    authOnly,
    async (
      request: FastifyRequest<{ Params: { stage: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { stage } = request.params;
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );

        const query = request.query as Record<string, unknown>;
        const page = parseInt(query.page as string, 10) || 1;
        const pageSize = parseInt(query.pageSize as string, 10) || 20;

        const result = await getJourneyStageWeddings(
          stage,
          startDate,
          endDate,
          page,
          pageSize
        );
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching journey stage weddings");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // ========================================
  // DETAIL ENDPOINTS
  // ========================================

  // GET /api/kpi/weddings/:weddingId
  fastify.get(
    "/kpi/weddings/:weddingId",
    authOnly,
    async (
      request: FastifyRequest<{ Params: { weddingId: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { weddingId } = request.params;
        const result = await getWeddingDetail(weddingId);

        if (!result) {
          return reply.status(404).send({ error: "Wedding not found" });
        }

        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching wedding detail");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // GET /api/kpi/wedders/:wedderId
  fastify.get(
    "/kpi/wedders/:wedderId",
    authOnly,
    async (
      request: FastifyRequest<{ Params: { wedderId: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { wedderId } = request.params;
        const result = await getWedderDetail(wedderId);

        if (!result) {
          return reply.status(404).send({ error: "Wedder not found" });
        }

        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching wedder detail");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // ========================================
  // WEDDERS LIST
  // ========================================

  // GET /api/kpi/wedders - Paginated list of wedders
  fastify.get(
    "/kpi/wedders",
    authOnly,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = request.query as Record<string, unknown>;
        const page = parseInt(query.page as string, 10) || 1;
        const pageSize = parseInt(query.pageSize as string, 10) || 20;
        const search = (query.search as string) || undefined;
        const provider = (query.provider as string) || undefined;
        const countryCode = (query.countryCode as string) || undefined;
        const sortBy = (query.sortBy as "createdAt" | "weddingsCount") || "createdAt";
        const sortOrder = (query.sortOrder as "asc" | "desc") || "desc";

        const result = await getWeddersList({
          page,
          pageSize,
          search,
          provider,
          countryCode,
          sortBy,
          sortOrder,
        });

        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching wedders list");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // ========================================
  // KPI WEDDINGS LIST (GENERIC)
  // ========================================

  // GET /api/kpi/:category/:slug/weddings - Get weddings for a specific KPI
  fastify.get(
    "/kpi/:category/:slug/weddings",
    authOnly,
    async (
      request: FastifyRequest<{ Params: { category: string; slug: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { slug } = request.params;
        const { startDate, endDate } = parseDateRange(
          request.query as Record<string, unknown>
        );

        const query = request.query as Record<string, unknown>;
        const page = parseInt(query.page as string, 10) || 1;
        const pageSize = parseInt(query.pageSize as string, 10) || 20;

        const result = await getWeddingsByKPIFilter(
          slug,
          startDate,
          endDate,
          page,
          pageSize
        );
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, "Error fetching KPI weddings");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.log.info("Wedded KPI routes registered");
}
