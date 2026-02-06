/**
 * Drill-Down Repository
 *
 * Provides methods to fetch lists of weddings for drill-down analytics,
 * as well as detailed views of individual weddings and wedders.
 */

import { supabase } from "../../supabase.js";
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

export class SupabaseDrillDownRepository implements DrillDownRepository {
  async getWeddingsByDropOffQuestion(
    questionId: string,
    params: DrillDownParams
  ): Promise<WeddingListResult> {
    const { startDate, endDate, page, pageSize } = params;
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get incomplete sessions
    const { data: incompleteSessions, error: sessionsError } =
      await supabase.client
        .from("onboarding_sessions")
        .select("wedding_id")
        .is("completed_at", null)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

    if (sessionsError) throw sessionsError;

    const incompleteWeddingIds = (incompleteSessions || []).map(
      (s: { wedding_id: string }) => s.wedding_id
    );

    if (incompleteWeddingIds.length === 0) {
      return { weddings: [], total: 0, page, pageSize };
    }

    // Get answers for these weddings
    const { data: answers, error: answersError } = await supabase.client
      .from("wedder_answers")
      .select("wedding_id, question_id, answered_at")
      .in("wedding_id", incompleteWeddingIds)
      .not("answered_at", "is", null)
      .order("answered_at", { ascending: false });

    if (answersError) throw answersError;

    // Find weddings whose last answered question matches questionId
    const lastQuestionPerWedding = new Map<string, string>();
    for (const answer of (answers as WedderAnswerRow[]) || []) {
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
    const { data: sessions, error: sessionsError } = await supabase.client
      .from("onboarding_sessions")
      .select("wedding_id, completed_phases")
      .is("completed_at", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (sessionsError) throw sessionsError;

    // Filter by stage
    const matchingWeddingIds: string[] = [];
    for (const session of (sessions as OnboardingSessionRow[]) || []) {
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
    const { data: sessions, error: sessionsError } = await supabase.client
      .from("onboarding_sessions")
      .select("wedding_id, completed_phases, completed_at")
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (sessionsError) throw sessionsError;

    // Filter by journey stage
    const matchingWeddingIds: string[] = [];
    for (const session of (sessions as OnboardingSessionRow[]) || []) {
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
    const { data: wedding, error: weddingError } = await supabase.client
      .from("weddings")
      .select("id, created_at, wedding_date, archived, wedder_1_id, wedder_2_id")
      .eq("id", weddingId)
      .single();

    if (weddingError || !wedding) return null;

    const weddingRow = wedding as WeddingRow;

    // Fetch wedders
    const wedder1 = await this.fetchWedderSummary(weddingRow.wedder_1_id);
    const wedder2 = weddingRow.wedder_2_id
      ? await this.fetchWedderSummary(weddingRow.wedder_2_id)
      : null;

    // Fetch onboarding session
    const { data: onboardingSession } = await supabase.client
      .from("onboarding_sessions")
      .select("completed_phases, completed_at")
      .eq("wedding_id", weddingId)
      .single();

    const completedPhases =
      (onboardingSession as OnboardingSessionRow | null)?.completed_phases || [];
    const completedAt =
      (onboardingSession as OnboardingSessionRow | null)?.completed_at || null;

    // Fetch tasks
    const { data: tasks } = await supabase.client
      .from("tasks")
      .select("completed")
      .eq("wedding_id", weddingId)
      .is("deleted_at", null);

    const tasksList = (tasks as TaskRow[]) || [];
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter((t) => t.completed).length;

    // Fetch vendors (retailers_in_weddings table)
    const { data: vendors } = await supabase.client
      .from("retailers_in_weddings")
      .select("status")
      .eq("wedding_id", weddingId)
      .is("deleted_at", null);

    const vendorsList = (vendors as RetailerInWeddingRow[]) || [];
    const saved = vendorsList.filter((v) => v.status === "SAVED").length;
    const contacted = vendorsList.filter((v) => v.status === "CONTACTED").length;
    const hired = vendorsList.filter((v) => v.status === "HIRED").length;
    const recommended = vendorsList.filter((v) => v.status === "RECOMMENDED").length;
    const weddingPlanner = vendorsList.filter((v) => v.status === "WEDDING_PLANNER").length;

    // Fetch missions
    const { data: missions } = await supabase.client
      .from("missions")
      .select("template_id, status")
      .eq("wedding_id", weddingId)
      .in("template_id", Object.values(MISSION_TEMPLATES));

    const missionsList = (missions as MissionRow[]) || [];
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
    const { data: wedder, error: wedderError } = await supabase.client
      .from("wedders")
      .select("id, created_at, country_code, provider")
      .eq("id", wedderId)
      .single();

    if (wedderError || !wedder) return null;

    const wedderRow = wedder as WedderRow;

    // Fetch weddings where this wedder is involved (weddings table doesn't have deleted_at)
    const { data: weddingsAsWedder1 } = await supabase.client
      .from("weddings")
      .select("id")
      .eq("wedder_1_id", wedderId);

    const { data: weddingsAsWedder2 } = await supabase.client
      .from("weddings")
      .select("id")
      .eq("wedder_2_id", wedderId);

    const weddingIds = [
      ...((weddingsAsWedder1 as { id: string }[]) || []).map((w) => w.id),
      ...((weddingsAsWedder2 as { id: string }[]) || []).map((w) => w.id),
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
    const { data: weddings, error: weddingsError } = await supabase.client
      .from("weddings")
      .select(
        "id, created_at, wedding_date, archived, wedder_1_id, wedder_2_id"
      )
      .in("id", weddingIds);

    if (weddingsError) throw weddingsError;

    // Fetch onboarding sessions for these weddings
    const { data: sessions } = await supabase.client
      .from("onboarding_sessions")
      .select("wedding_id, completed_phases, completed_at")
      .in("wedding_id", weddingIds);

    const sessionMap = new Map<
      string,
      { completed_phases: string[]; completed_at: string | null }
    >();
    for (const session of (sessions as OnboardingSessionRow[]) || []) {
      sessionMap.set(session.wedding_id, {
        completed_phases: session.completed_phases || [],
        completed_at: session.completed_at,
      });
    }

    return ((weddings as WeddingRow[]) || []).map((w) => {
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
    const { data: wedder, error } = await supabase.client
      .from("wedders")
      .select("id, first_name, created_at, country_code, provider")
      .eq("id", wedderId)
      .single();

    if (error || !wedder) return null;

    const wedderRow = wedder as WedderRow;
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
        const { data: sessions } = await supabase.client
          .from("onboarding_sessions")
          .select("wedding_id")
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (sessions || []).map((s: { wedding_id: string }) => s.wedding_id);
        break;
      }

      case "completed":
      case "completion-rate":
      case "avg-time": {
        // Weddings that completed onboarding
        const { data: sessions } = await supabase.client
          .from("onboarding_sessions")
          .select("wedding_id")
          .not("completed_at", "is", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (sessions || []).map((s: { wedding_id: string }) => s.wedding_id);
        break;
      }

      // Wedding KPIs
      case "active": {
        // Non-archived weddings
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .eq("archived", false)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      case "archived": {
        // Archived weddings
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .eq("archived", true)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      case "with-partner":
      case "partner-join-rate": {
        // Weddings with partner
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .not("wedder_2_id", "is", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      case "solo-planning": {
        // Weddings without partner
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .is("wedder_2_id", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      case "ceremony-date-set-rate": {
        // Weddings with ceremony date set
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .not("ceremony_date", "is", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      case "celebration-date-set-rate": {
        // Weddings with celebration date set
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .not("celebration_date", "is", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      case "without-ceremony-date": {
        // Weddings without ceremony date
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .is("ceremony_date", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      case "without-celebration-date": {
        // Weddings without celebration date
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .is("celebration_date", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      // Churn KPIs
      case "never-started": {
        const { data: sessions } = await supabase.client
          .from("onboarding_sessions")
          .select("wedding_id, completed_phases")
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (sessions || [])
          .filter((s: { completed_phases: string[] }) => (s.completed_phases || []).length === 0)
          .map((s: { wedding_id: string }) => s.wedding_id);
        break;
      }

      case "abandoned": {
        const { data: sessions } = await supabase.client
          .from("onboarding_sessions")
          .select("wedding_id, completed_phases")
          .is("completed_at", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (sessions || [])
          .filter((s: { completed_phases: string[] }) => (s.completed_phases || []).length > 0)
          .map((s: { wedding_id: string }) => s.wedding_id);
        break;
      }

      // --- NEW ENGAGEMENT KPIs ---

      case "with-tasks": {
        // Weddings with at least one task
        const { data: tasks } = await supabase.client
          .from("tasks")
          .select("wedding_id")
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = [...new Set((tasks || []).map((t: { wedding_id: string }) => t.wedding_id))];
        break;
      }

      case "with-vendors": {
        // Weddings with at least one vendor
        const { data: vendors } = await supabase.client
          .from("retailers_in_weddings")
          .select("wedding_id")
          .is("deleted_at", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = [...new Set((vendors || []).map((v: { wedding_id: string }) => v.wedding_id))];
        break;
      }

      case "task-completion-rate":
      case "avg-tasks": {
        // Weddings with tasks (for task-related KPIs)
        const { data: tasks } = await supabase.client
          .from("tasks")
          .select("wedding_id")
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = [...new Set((tasks || []).map((t: { wedding_id: string }) => t.wedding_id))];
        break;
      }

      case "vendor-contact-rate":
      case "vendor-hire-rate":
      case "avg-vendors": {
        // Weddings with vendors (for vendor-related KPIs)
        const { data: vendors } = await supabase.client
          .from("retailers_in_weddings")
          .select("wedding_id")
          .is("deleted_at", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = [...new Set((vendors || []).map((v: { wedding_id: string }) => v.wedding_id))];
        break;
      }

      // --- TIMELINE KPIs ---

      case "upcoming-30-days": {
        const today = new Date().toISOString().split("T")[0];
        const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .gte("ceremony_date", today)
          .lte("ceremony_date", thirtyDaysLater)
          .eq("archived", false);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      case "past-ceremony": {
        const today = new Date().toISOString().split("T")[0];
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .lt("ceremony_date", today)
          .not("ceremony_date", "is", null);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
        break;
      }

      case "same-day-events": {
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id, ceremony_date, celebration_date")
          .not("ceremony_date", "is", null)
          .not("celebration_date", "is", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || [])
          .filter((w: { ceremony_date: string; celebration_date: string }) =>
            w.ceremony_date === w.celebration_date
          )
          .map((w: { id: string }) => w.id);
        break;
      }

      case "multi-day-events": {
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id, ceremony_date, celebration_date")
          .not("ceremony_date", "is", null)
          .not("celebration_date", "is", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || [])
          .filter((w: { ceremony_date: string; celebration_date: string }) =>
            w.ceremony_date !== w.celebration_date
          )
          .map((w: { id: string }) => w.id);
        break;
      }

      // --- MISSION KPIs ---

      case "missions-started": {
        const { data: missions } = await supabase.client
          .from("missions")
          .select("wedding_id")
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = [...new Set((missions || []).map((m: { wedding_id: string }) => m.wedding_id))];
        break;
      }

      case "missions-completed": {
        const { data: missions } = await supabase.client
          .from("missions")
          .select("wedding_id")
          .eq("status", "COMPLETED")
          .gte("updated_at", startISO)
          .lte("updated_at", endISO);
        matchingWeddingIds = [...new Set((missions || []).map((m: { wedding_id: string }) => m.wedding_id))];
        break;
      }

      case "ceremony-venue-booked": {
        const { data: missions } = await supabase.client
          .from("missions")
          .select("wedding_id")
          .eq("template_id", "CEREMONY_VENUE")
          .eq("status", "COMPLETED")
          .gte("updated_at", startISO)
          .lte("updated_at", endISO);
        matchingWeddingIds = [...new Set((missions || []).map((m: { wedding_id: string }) => m.wedding_id))];
        break;
      }

      case "celebration-venue-booked": {
        const { data: missions } = await supabase.client
          .from("missions")
          .select("wedding_id")
          .eq("template_id", "CELEBRATION_VENUE")
          .eq("status", "COMPLETED")
          .gte("updated_at", startISO)
          .lte("updated_at", endISO);
        matchingWeddingIds = [...new Set((missions || []).map((m: { wedding_id: string }) => m.wedding_id))];
        break;
      }

      // --- COMPOSITE KPIs ---

      case "fully-engaged": {
        // Weddings with completed onboarding, tasks, and vendors
        const { data: completedOnboarding } = await supabase.client
          .from("onboarding_sessions")
          .select("wedding_id")
          .not("completed_at", "is", null)
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        const onboardedSet = new Set((completedOnboarding || []).map((s: { wedding_id: string }) => s.wedding_id));

        const { data: tasks } = await supabase.client
          .from("tasks")
          .select("wedding_id");
        const tasksSet = new Set((tasks || []).map((t: { wedding_id: string }) => t.wedding_id));

        const { data: vendors } = await supabase.client
          .from("retailers_in_weddings")
          .select("wedding_id")
          .is("deleted_at", null);
        const vendorsSet = new Set((vendors || []).map((v: { wedding_id: string }) => v.wedding_id));

        matchingWeddingIds = [...onboardedSet].filter(
          (id) => tasksSet.has(id) && vendorsSet.has(id)
        );
        break;
      }

      // Default: all weddings in date range
      default: {
        const { data: weddings } = await supabase.client
          .from("weddings")
          .select("id")
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        matchingWeddingIds = (weddings || []).map((w: { id: string }) => w.id);
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
