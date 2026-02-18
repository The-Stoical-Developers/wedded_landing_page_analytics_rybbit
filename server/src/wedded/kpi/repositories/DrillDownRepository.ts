/**
 * Drill-Down Repository
 *
 * Provides methods to fetch lists of weddings for drill-down analytics,
 * as well as detailed views of individual weddings and wedders.
 */

import { query, queryOne } from "./queryHelper.js";
import {
  DrillDownRepository,
  DrillDownParams,
  WeddingListResult,
  WeddingSummary,
  WeddingDetail,
  WedderDetail,
  WedderSummary,
  OnboardingStatus,
  MissionStatus,
} from "./types.js";

// Phase names for completed phases array
const ONBOARDING_PHASES = [
  "PHASE_INFO",
  "PHASE_ENGAGEMENT",
  "PHASE_CEREMONY",
  "PHASE_CELEBRATION",
  "PHASE_GUESTS",
];

// Churn stage definitions for filtering
const CHURN_STAGES: Record<string, { filter: (phases: string[]) => boolean }> = {
  never_started: {
    filter: (phases) => phases.length === 0,
  },
  abandoned_info: {
    filter: (phases) =>
      phases.includes("PHASE_INFO") && !phases.includes("PHASE_ENGAGEMENT"),
  },
  abandoned_engagement: {
    filter: (phases) =>
      phases.includes("PHASE_ENGAGEMENT") && !phases.includes("PHASE_CEREMONY"),
  },
  abandoned_ceremony: {
    filter: (phases) =>
      phases.includes("PHASE_CEREMONY") &&
      !phases.includes("PHASE_CELEBRATION"),
  },
  abandoned_celebration: {
    filter: (phases) =>
      phases.includes("PHASE_CELEBRATION") && !phases.includes("PHASE_GUESTS"),
  },
};

// Journey stage mapping
const JOURNEY_STAGES: Record<string, { minPhases: number }> = {
  registered: { minPhases: 0 },
  wedding_created: { minPhases: 0 },
  onboarding_started: { minPhases: 1 },
  onboarding_completed: { minPhases: 5 },
};

interface OnboardingSessionRow {
  wedding_id: string;
  completed_phases: string[];
  completed_at: string | null;
}

interface WeddingRow {
  id: string;
  created_at: string;
  wedding_date: string | null;
  archived: boolean;
  wedder_1_id: string;
  wedder_2_id: string | null;
}

interface WedderRow {
  id: string;
  first_name: string | null;
  created_at: string;
  country_code: string | null;
  provider: string | null;
}

interface WedderAnswerRow {
  wedding_id: string;
  question_id: string;
  answered_at: string;
}

interface TaskRow {
  completed: boolean;
}

interface RetailerInWeddingRow {
  status: string;
}

interface MissionRow {
  template_id: string;
  status: string;
}

const MISSION_TEMPLATES = {
  ceremony: "CEREMONY_VENUE",
  celebration: "CELEBRATION_VENUE",
  photography: "HIRE_PHOTOGRAPHER",
};

function determineOnboardingStatus(
  completedPhases: string[],
  completedAt: string | null
): OnboardingStatus {
  if (completedAt) return "completed";
  if (completedPhases.length > 0) return "in_progress";
  return "not_started";
}

function determineMissionStatus(missionStatus: string | null): MissionStatus {
  if (missionStatus === "COMPLETED") return "completed";
  if (missionStatus) return "in_progress";
  return "not_started";
}

export class PgDrillDownRepository implements DrillDownRepository {
  async getWeddingsByDropOffQuestion(
    questionId: string,
    params: DrillDownParams
  ): Promise<WeddingListResult> {
    const { startDate, endDate, page, pageSize } = params;
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get incomplete sessions
    const incompleteSessions = await query<{ wedding_id: string }>(
      `SELECT wedding_id FROM public.onboarding_sessions
       WHERE completed_at IS NULL AND created_at >= $1 AND created_at <= $2`,
      [startISO, endISO]
    );

    const incompleteWeddingIds = incompleteSessions.map(
      (s) => s.wedding_id
    );

    if (incompleteWeddingIds.length === 0) {
      return { weddings: [], total: 0, page, pageSize };
    }

    // Get answers for these weddings
    const answers = await query<WedderAnswerRow>(
      `SELECT wedding_id, question_id, answered_at FROM public.wedder_answers
       WHERE wedding_id = ANY($1::uuid[]) AND answered_at IS NOT NULL
       ORDER BY answered_at DESC`,
      [incompleteWeddingIds]
    );

    // Find weddings whose last answered question matches questionId
    const lastQuestionPerWedding = new Map<string, string>();
    for (const answer of answers) {
      if (!lastQuestionPerWedding.has(answer.wedding_id)) {
        lastQuestionPerWedding.set(answer.wedding_id, answer.question_id);
      }
    }

    const matchingWeddingIds: string[] = [];
    for (const [weddingId, lastQuestion] of lastQuestionPerWedding) {
      if (lastQuestion === questionId) {
        matchingWeddingIds.push(weddingId);
      }
    }

    const total = matchingWeddingIds.length;

    if (total === 0) {
      return { weddings: [], total: 0, page, pageSize };
    }

    // Paginate
    const offset = (page - 1) * pageSize;
    const paginatedIds = matchingWeddingIds.slice(offset, offset + pageSize);

    // Fetch wedding details
    const weddings = await this.fetchWeddingSummaries(paginatedIds);

    return { weddings, total, page, pageSize };
  }

  async getWeddingsByChurnStage(
    stage: string,
    params: DrillDownParams
  ): Promise<WeddingListResult> {
    const { startDate, endDate, page, pageSize } = params;
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const stageConfig = CHURN_STAGES[stage];
    if (!stageConfig) {
      return { weddings: [], total: 0, page, pageSize };
    }

    // Get all onboarding sessions
    const sessions = await query<OnboardingSessionRow>(
      `SELECT wedding_id, completed_phases FROM public.onboarding_sessions
       WHERE completed_at IS NULL AND created_at >= $1 AND created_at <= $2`,
      [startISO, endISO]
    );

    // Filter by stage
    const matchingWeddingIds: string[] = [];
    for (const session of sessions) {
      if (stageConfig.filter(session.completed_phases || [])) {
        matchingWeddingIds.push(session.wedding_id);
      }
    }

    const total = matchingWeddingIds.length;

    if (total === 0) {
      return { weddings: [], total: 0, page, pageSize };
    }

    // Paginate
    const offset = (page - 1) * pageSize;
    const paginatedIds = matchingWeddingIds.slice(offset, offset + pageSize);

    // Fetch wedding details
    const weddings = await this.fetchWeddingSummaries(paginatedIds);

    return { weddings, total, page, pageSize };
  }

  async getWeddingsByJourneyStage(
    stage: string,
    params: DrillDownParams
  ): Promise<WeddingListResult> {
    const { startDate, endDate, page, pageSize } = params;
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const stageConfig = JOURNEY_STAGES[stage];
    if (!stageConfig) {
      return { weddings: [], total: 0, page, pageSize };
    }

    // Get all onboarding sessions with completed phases count
    const sessions = await query<OnboardingSessionRow>(
      `SELECT wedding_id, completed_phases, completed_at FROM public.onboarding_sessions
       WHERE created_at >= $1 AND created_at <= $2`,
      [startISO, endISO]
    );

    // Filter by journey stage
    const matchingWeddingIds: string[] = [];
    for (const session of sessions) {
      const phasesCount = (session.completed_phases || []).length;

      // For specific stages, filter appropriately
      if (stage === "registered" || stage === "wedding_created") {
        matchingWeddingIds.push(session.wedding_id);
      } else if (stage === "onboarding_started") {
        if (phasesCount >= 1 && !session.completed_at) {
          matchingWeddingIds.push(session.wedding_id);
        }
      } else if (stage === "onboarding_completed") {
        if (session.completed_at) {
          matchingWeddingIds.push(session.wedding_id);
        }
      }
    }

    const total = matchingWeddingIds.length;

    if (total === 0) {
      return { weddings: [], total: 0, page, pageSize };
    }

    // Paginate
    const offset = (page - 1) * pageSize;
    const paginatedIds = matchingWeddingIds.slice(offset, offset + pageSize);

    // Fetch wedding details
    const weddings = await this.fetchWeddingSummaries(paginatedIds);

    return { weddings, total, page, pageSize };
  }

  async getWeddingDetail(weddingId: string): Promise<WeddingDetail | null> {
    // Fetch wedding
    const weddingRow = await queryOne<WeddingRow>(
      `SELECT id, created_at, wedding_date, archived, wedder_1_id, wedder_2_id
       FROM public.weddings WHERE id = $1`,
      [weddingId]
    );

    if (!weddingRow) return null;

    // Fetch wedders
    const wedder1 = await this.fetchWedderSummary(weddingRow.wedder_1_id);
    const wedder2 = weddingRow.wedder_2_id
      ? await this.fetchWedderSummary(weddingRow.wedder_2_id)
      : null;

    // Fetch onboarding session
    const onboardingSession = await queryOne<OnboardingSessionRow>(
      `SELECT completed_phases, completed_at FROM public.onboarding_sessions
       WHERE wedding_id = $1`,
      [weddingId]
    );

    const completedPhases = onboardingSession?.completed_phases || [];
    const completedAt = onboardingSession?.completed_at || null;

    // Fetch tasks
    const tasksList = await query<TaskRow>(
      `SELECT completed FROM public.tasks
       WHERE wedding_id = $1 AND deleted_at IS NULL`,
      [weddingId]
    );

    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter((t) => t.completed).length;

    // Fetch vendors (retailers_in_weddings table)
    const vendorsList = await query<RetailerInWeddingRow>(
      `SELECT status FROM public.retailers_in_weddings
       WHERE wedding_id = $1 AND deleted_at IS NULL`,
      [weddingId]
    );

    const saved = vendorsList.filter((v) => v.status === "SAVED").length;
    const contacted = vendorsList.filter((v) => v.status === "CONTACTED").length;
    const hired = vendorsList.filter((v) => v.status === "HIRED").length;
    const recommended = vendorsList.filter((v) => v.status === "RECOMMENDED").length;
    const weddingPlanner = vendorsList.filter((v) => v.status === "WEDDING_PLANNER").length;

    // Fetch missions
    const missionsList = await query<MissionRow>(
      `SELECT template_id, status FROM public.missions
       WHERE wedding_id = $1 AND template_id = ANY($2::text[])`,
      [weddingId, Object.values(MISSION_TEMPLATES)]
    );

    const ceremonyMission = missionsList.find(
      (m) => m.template_id === MISSION_TEMPLATES.ceremony
    );
    const celebrationMission = missionsList.find(
      (m) => m.template_id === MISSION_TEMPLATES.celebration
    );
    const photographyMission = missionsList.find(
      (m) => m.template_id === MISSION_TEMPLATES.photography
    );

    return {
      id: weddingRow.id,
      createdAt: weddingRow.created_at,
      weddingDate: weddingRow.wedding_date,
      archived: weddingRow.archived,
      wedder1,
      wedder2,
      onboarding: {
        status: determineOnboardingStatus(completedPhases, completedAt),
        completedPhases,
        completedAt,
      },
      tasks: { total: totalTasks, completed: completedTasks },
      vendors: { saved, contacted, hired, recommended, weddingPlanner },
      missions: {
        ceremony: determineMissionStatus(ceremonyMission?.status || null),
        celebration: determineMissionStatus(celebrationMission?.status || null),
        photography: determineMissionStatus(photographyMission?.status || null),
      },
    };
  }

  async getWedderDetail(wedderId: string): Promise<WedderDetail | null> {
    // Fetch wedder
    const wedderRow = await queryOne<WedderRow>(
      `SELECT id, created_at, country_code, provider FROM public.wedders WHERE id = $1`,
      [wedderId]
    );

    if (!wedderRow) return null;

    // Fetch weddings where this wedder is involved (weddings table doesn't have deleted_at)
    const weddingsAsWedder1 = await query<{ id: string }>(
      `SELECT id FROM public.weddings WHERE wedder_1_id = $1`,
      [wedderId]
    );

    const weddingsAsWedder2 = await query<{ id: string }>(
      `SELECT id FROM public.weddings WHERE wedder_2_id = $1`,
      [wedderId]
    );

    const weddingIds = [
      ...weddingsAsWedder1.map((w) => w.id),
      ...weddingsAsWedder2.map((w) => w.id),
    ];

    const weddings =
      weddingIds.length > 0
        ? await this.fetchWeddingSummaries(weddingIds)
        : [];

    return {
      id: wedderRow.id,
      createdAt: wedderRow.created_at,
      countryCode: wedderRow.country_code,
      provider: wedderRow.provider,
      weddings,
    };
  }

  private async fetchWeddingSummaries(
    weddingIds: string[]
  ): Promise<WeddingSummary[]> {
    if (weddingIds.length === 0) return [];

    // Fetch weddings (weddings table doesn't have deleted_at column)
    const weddingsRows = await query<WeddingRow>(
      `SELECT id, created_at, wedding_date, archived, wedder_1_id, wedder_2_id
       FROM public.weddings WHERE id = ANY($1::uuid[])`,
      [weddingIds]
    );

    // Fetch onboarding sessions for these weddings
    const sessions = await query<OnboardingSessionRow>(
      `SELECT wedding_id, completed_phases, completed_at
       FROM public.onboarding_sessions WHERE wedding_id = ANY($1::uuid[])`,
      [weddingIds]
    );

    const sessionMap = new Map<
      string,
      { completed_phases: string[]; completed_at: string | null }
    >();
    for (const session of sessions) {
      sessionMap.set(session.wedding_id, {
        completed_phases: session.completed_phases || [],
        completed_at: session.completed_at,
      });
    }

    return weddingsRows.map((w) => {
      const session = sessionMap.get(w.id);
      return {
        id: w.id,
        createdAt: w.created_at,
        weddingDate: w.wedding_date,
        archived: w.archived,
        wedder1Id: w.wedder_1_id,
        wedder2Id: w.wedder_2_id,
        hasPartner: w.wedder_2_id !== null,
        onboardingStatus: determineOnboardingStatus(
          session?.completed_phases || [],
          session?.completed_at || null
        ),
      };
    });
  }

  private async fetchWedderSummary(
    wedderId: string
  ): Promise<WedderSummary | null> {
    const wedderRow = await queryOne<WedderRow>(
      `SELECT id, first_name, created_at, country_code, provider
       FROM public.wedders WHERE id = $1`,
      [wedderId]
    );

    if (!wedderRow) return null;

    return {
      id: wedderRow.id,
      name: wedderRow.first_name,
      createdAt: wedderRow.created_at,
      countryCode: wedderRow.country_code,
      provider: wedderRow.provider,
    };
  }

  /**
   * Get weddings filtered by KPI type/slug
   * Maps KPI slugs to their corresponding wedding filters
   */
  async getWeddingsByKPIFilter(
    kpiSlug: string,
    params: DrillDownParams
  ): Promise<WeddingListResult> {
    const { startDate, endDate, page, pageSize } = params;
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    let matchingWeddingIds: string[] = [];

    switch (kpiSlug) {
      // Onboarding KPIs
      case "started": {
        // Weddings that started onboarding
        const sessions = await query<{ wedding_id: string }>(
          `SELECT wedding_id FROM public.onboarding_sessions
           WHERE created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = sessions.map((s) => s.wedding_id);
        break;
      }

      case "completed":
      case "completion-rate":
      case "avg-time": {
        // Weddings that completed onboarding
        const sessions = await query<{ wedding_id: string }>(
          `SELECT wedding_id FROM public.onboarding_sessions
           WHERE completed_at IS NOT NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = sessions.map((s) => s.wedding_id);
        break;
      }

      // Wedding KPIs
      case "active": {
        // Non-archived weddings
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE archived = false AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      case "archived": {
        // Archived weddings
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE archived = true AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      case "with-partner":
      case "partner-join-rate": {
        // Weddings with partner
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE wedder_2_id IS NOT NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      case "solo-planning": {
        // Weddings without partner
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE wedder_2_id IS NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      case "ceremony-date-set-rate": {
        // Weddings with ceremony date set
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE wedding_date IS NOT NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      case "celebration-date-set-rate": {
        // Weddings with celebration date set
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE engagement_date IS NOT NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      case "without-ceremony-date": {
        // Weddings without ceremony date
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE wedding_date IS NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      case "without-celebration-date": {
        // Weddings without celebration date
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE engagement_date IS NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      // Churn KPIs
      case "never-started": {
        const sessions = await query<{ wedding_id: string; completed_phases: string[] }>(
          `SELECT wedding_id, completed_phases FROM public.onboarding_sessions
           WHERE created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = sessions
          .filter((s) => (s.completed_phases || []).length === 0)
          .map((s) => s.wedding_id);
        break;
      }

      case "abandoned": {
        const sessions = await query<{ wedding_id: string; completed_phases: string[] }>(
          `SELECT wedding_id, completed_phases FROM public.onboarding_sessions
           WHERE completed_at IS NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = sessions
          .filter((s) => (s.completed_phases || []).length > 0)
          .map((s) => s.wedding_id);
        break;
      }

      // --- NEW ENGAGEMENT KPIs ---

      case "with-tasks":
      case "task-completion-rate":
      case "avg-tasks": {
        // Weddings with at least one task
        const tasks = await query<{ wedding_id: string }>(
          `SELECT DISTINCT wedding_id FROM public.tasks
           WHERE created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = tasks.map((t) => t.wedding_id);
        break;
      }

      case "with-vendors":
      case "vendor-contact-rate":
      case "vendor-hire-rate":
      case "avg-vendors": {
        // Weddings with at least one vendor
        const vendors = await query<{ wedding_id: string }>(
          `SELECT DISTINCT wedding_id FROM public.retailers_in_weddings
           WHERE deleted_at IS NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = vendors.map((v) => v.wedding_id);
        break;
      }

      // --- TIMELINE KPIs ---

      case "upcoming-30-days": {
        const today = new Date().toISOString().split("T")[0];
        const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE wedding_date >= $1 AND wedding_date <= $2 AND archived = false`,
          [today, thirtyDaysLater]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      case "past-ceremony": {
        const today = new Date().toISOString().split("T")[0];
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE wedding_date < $1 AND wedding_date IS NOT NULL`,
          [today]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
        break;
      }

      case "same-day-events": {
        const weddings = await query<{ id: string; wedding_date: string; engagement_date: string }>(
          `SELECT id, wedding_date, engagement_date FROM public.weddings
           WHERE wedding_date IS NOT NULL AND engagement_date IS NOT NULL
           AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings
          .filter((w) => w.wedding_date === w.engagement_date)
          .map((w) => w.id);
        break;
      }

      case "multi-day-events": {
        const weddings = await query<{ id: string; wedding_date: string; engagement_date: string }>(
          `SELECT id, wedding_date, engagement_date FROM public.weddings
           WHERE wedding_date IS NOT NULL AND engagement_date IS NOT NULL
           AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings
          .filter((w) => w.wedding_date !== w.engagement_date)
          .map((w) => w.id);
        break;
      }

      // --- MISSION KPIs ---

      case "missions-started": {
        const missions = await query<{ wedding_id: string }>(
          `SELECT DISTINCT wedding_id FROM public.missions
           WHERE created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = missions.map((m) => m.wedding_id);
        break;
      }

      case "missions-completed": {
        const missions = await query<{ wedding_id: string }>(
          `SELECT DISTINCT wedding_id FROM public.missions
           WHERE status = 'COMPLETED' AND updated_at >= $1 AND updated_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = missions.map((m) => m.wedding_id);
        break;
      }

      case "ceremony-venue-booked": {
        const missions = await query<{ wedding_id: string }>(
          `SELECT DISTINCT wedding_id FROM public.missions
           WHERE template_id = 'CEREMONY_VENUE' AND status = 'COMPLETED'
           AND updated_at >= $1 AND updated_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = missions.map((m) => m.wedding_id);
        break;
      }

      case "celebration-venue-booked": {
        const missions = await query<{ wedding_id: string }>(
          `SELECT DISTINCT wedding_id FROM public.missions
           WHERE template_id = 'CELEBRATION_VENUE' AND status = 'COMPLETED'
           AND updated_at >= $1 AND updated_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = missions.map((m) => m.wedding_id);
        break;
      }

      // --- COMPOSITE KPIs ---

      case "fully-engaged": {
        // Weddings with completed onboarding, tasks, and vendors
        const completedOnboarding = await query<{ wedding_id: string }>(
          `SELECT wedding_id FROM public.onboarding_sessions
           WHERE completed_at IS NOT NULL AND created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        const onboardedSet = new Set(completedOnboarding.map((s) => s.wedding_id));

        const tasks = await query<{ wedding_id: string }>(
          `SELECT DISTINCT wedding_id FROM public.tasks`
        );
        const tasksSet = new Set(tasks.map((t) => t.wedding_id));

        const vendors = await query<{ wedding_id: string }>(
          `SELECT DISTINCT wedding_id FROM public.retailers_in_weddings
           WHERE deleted_at IS NULL`
        );
        const vendorsSet = new Set(vendors.map((v) => v.wedding_id));

        matchingWeddingIds = [...onboardedSet].filter(
          (id) => tasksSet.has(id) && vendorsSet.has(id)
        );
        break;
      }

      // Default: all weddings in date range
      default: {
        const weddings = await query<{ id: string }>(
          `SELECT id FROM public.weddings
           WHERE created_at >= $1 AND created_at <= $2`,
          [startISO, endISO]
        );
        matchingWeddingIds = weddings.map((w) => w.id);
      }
    }

    const total = matchingWeddingIds.length;

    if (total === 0) {
      return { weddings: [], total: 0, page, pageSize };
    }

    // Paginate
    const offset = (page - 1) * pageSize;
    const paginatedIds = matchingWeddingIds.slice(offset, offset + pageSize);

    // Fetch wedding details
    const weddings = await this.fetchWeddingSummaries(paginatedIds);

    return { weddings, total, page, pageSize };
  }
}
