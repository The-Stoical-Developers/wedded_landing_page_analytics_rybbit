/**
 * Journey Analytics Repository
 *
 * Provides customer journey funnel, milestones, and timeline data from Supabase.
 */

import { supabase } from "../../supabase.js";
import {
  JourneyAnalyticsRepository,
  JourneyFunnelResult,
  JourneyStage,
  JourneyMilestonesResult,
  JourneyMilestone,
  JourneyTimelineResult,
  JourneyTimelinePoint,
} from "./types.js";

interface WedderRow {
  id: string;
  created_at: string;
}

interface WeddingRow {
  id: string;
  wedder_1_id: string | null;
  created_at: string;
}

interface OnboardingSessionRow {
  wedding_id: string;
  completed_phases: string[];
  completed_at: string | null;
}

interface MissionRow {
  template_id: string;
  wedding_id: string;
  created_at: string;
  updated_at: string;
  status: string;
}

const JOURNEY_STAGES = [
  { id: "registered", name: "Registered" },
  { id: "wedding_created", name: "Wedding Created" },
  { id: "onboarding_completed", name: "Onboarding Completed" },
  { id: "tutorial_completed", name: "Tutorial Completed" },
  { id: "ceremony_mission", name: "Ceremony Venue Mission" },
  { id: "celebration_mission", name: "Celebration Venue Mission" },
  { id: "photography_mission", name: "Photography Mission" },
];

const MISSION_TEMPLATES = {
  ceremony: "CEREMONY_VENUE",
  celebration: "CELEBRATION_VENUE",
  photography: "HIRE_PHOTOGRAPHER",
};

// Onboarding is considered "completed" when user finishes PHASE_CELEBRATION
const ONBOARDING_COMPLETION_PHASE = "PHASE_CELEBRATION";

export class SupabaseJourneyAnalyticsRepository
  implements JourneyAnalyticsRepository
{
  async getFunnel(
    startDate: Date,
    endDate: Date
  ): Promise<JourneyFunnelResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Stage 1: Get users registered in date range
    const { data: weddersDataRaw, error: regError } = await supabase.client
      .from("wedders")
      .select("id, created_at")
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (regError) throw regError;
    const weddersData = weddersDataRaw as WedderRow[] | null;
    const registeredUserIds = new Set((weddersData || []).map((w) => w.id));
    const registered = registeredUserIds.size;

    if (registered === 0) {
      return this.buildEmptyFunnel();
    }

    // Stage 2: Get weddings where wedder_1_id is in our cohort
    const { data: weddingsDataRaw, error: wedError } = await supabase.client
      .from("weddings")
      .select("id, wedder_1_id, created_at")
      .in("wedder_1_id", Array.from(registeredUserIds));

    if (wedError) throw wedError;
    const weddingsData = weddingsDataRaw as WeddingRow[] | null;
    const cohortWeddingIds = new Set((weddingsData || []).map((w) => w.id));
    const weddingsCreated = cohortWeddingIds.size;

    if (weddingsCreated === 0) {
      return this.buildFunnelWithCounts([registered, 0, 0, 0, 0, 0, 0]);
    }

    // Stage 3: Onboarding completed
    const { data: onboardingDataRaw, error: onbError } = await supabase.client
      .from("onboarding_sessions")
      .select("wedding_id, completed_phases, completed_at")
      .in("wedding_id", Array.from(cohortWeddingIds));

    if (onbError) throw onbError;
    const onboardingData = onboardingDataRaw as OnboardingSessionRow[] | null;

    const onboardingCompletedWeddings = new Set<string>();
    for (const session of onboardingData || []) {
      const phases = Array.isArray(session.completed_phases)
        ? session.completed_phases
        : [];
      if (phases.includes(ONBOARDING_COMPLETION_PHASE)) {
        onboardingCompletedWeddings.add(session.wedding_id);
      }
    }
    const onboardingCompleted = onboardingCompletedWeddings.size;

    // Stage 4: Tutorial completed
    const { data: tutorialAnswersRaw, error: tutError } = await supabase.client
      .from("wedder_answers")
      .select("wedding_id")
      .in("wedding_id", Array.from(onboardingCompletedWeddings))
      .in("question_id", [
        "ceremony_venue_booked",
        "venue_search_started",
        "photographer_booked",
      ]);

    if (tutError) throw tutError;
    const tutorialAnswers = tutorialAnswersRaw as
      | { wedding_id: string }[]
      | null;
    const tutorialCompletedWeddings = new Set(
      (tutorialAnswers || []).map((a) => a.wedding_id)
    );
    const tutorialCompleted = tutorialCompletedWeddings.size;

    // Stage 5-7: Mission completions
    const missionCounts = await this.getMissionCountsForCohort(
      Array.from(cohortWeddingIds)
    );

    // Build funnel
    const stageCounts = [
      registered,
      weddingsCreated,
      onboardingCompleted,
      tutorialCompleted,
      missionCounts.ceremony,
      missionCounts.celebration,
      missionCounts.photography,
    ];

    return this.buildFunnelWithCounts(stageCounts);
  }

  private buildEmptyFunnel(): JourneyFunnelResult {
    return this.buildFunnelWithCounts([0, 0, 0, 0, 0, 0, 0]);
  }

  private buildFunnelWithCounts(stageCounts: number[]): JourneyFunnelResult {
    const registered = stageCounts[0];

    const stages: JourneyStage[] = JOURNEY_STAGES.map((stage, index) => {
      const count = stageCounts[index];
      const previousCount = index === 0 ? count : stageCounts[index - 1];
      const percentage =
        registered > 0 ? Math.round((count / registered) * 10000) / 100 : 0;
      const dropOffCount = Math.max(0, previousCount - count);
      const dropOffRate =
        previousCount > 0
          ? Math.round((dropOffCount / previousCount) * 10000) / 100
          : 0;

      return {
        stage: stage.id,
        stageName: stage.name,
        count,
        percentage,
        dropOffCount,
        dropOffRate,
      };
    });

    const fullyCompleted = stageCounts[6];
    const overallCompletionRate =
      registered > 0
        ? Math.round((fullyCompleted / registered) * 10000) / 100
        : 0;

    return {
      stages,
      totalUsers: registered,
      fullyCompleted,
      overallCompletionRate,
    };
  }

  private async getMissionCountsForCohort(
    weddingIds: string[]
  ): Promise<{
    ceremony: number;
    celebration: number;
    photography: number;
  }> {
    if (weddingIds.length === 0) {
      return { ceremony: 0, celebration: 0, photography: 0 };
    }

    const { data: missionDataRaw, error } = await supabase.client
      .from("missions")
      .select("template_id, wedding_id, status")
      .eq("status", "COMPLETED")
      .in("template_id", Object.values(MISSION_TEMPLATES))
      .in("wedding_id", weddingIds);

    if (error) throw error;
    const missionData = missionDataRaw as
      | { template_id: string; wedding_id: string; status: string }[]
      | null;

    const ceremonyWeddings = new Set<string>();
    const celebrationWeddings = new Set<string>();
    const photographyWeddings = new Set<string>();

    for (const mission of missionData || []) {
      if (mission.template_id === MISSION_TEMPLATES.ceremony) {
        ceremonyWeddings.add(mission.wedding_id);
      } else if (mission.template_id === MISSION_TEMPLATES.celebration) {
        celebrationWeddings.add(mission.wedding_id);
      } else if (mission.template_id === MISSION_TEMPLATES.photography) {
        photographyWeddings.add(mission.wedding_id);
      }
    }

    return {
      ceremony: ceremonyWeddings.size,
      celebration: celebrationWeddings.size,
      photography: photographyWeddings.size,
    };
  }

  async getMilestones(
    startDate: Date,
    endDate: Date
  ): Promise<JourneyMilestonesResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get total weddings in period
    const { count: totalWeddingsCount, error: wedError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (wedError) throw wedError;
    const totalWeddings = totalWeddingsCount || 0;

    // Get mission completions with timing
    const { data: missionDataRaw, error: missionError } = await supabase.client
      .from("missions")
      .select("template_id, wedding_id, created_at, updated_at, status")
      .in("template_id", Object.values(MISSION_TEMPLATES))
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (missionError) throw missionError;
    const missionData = missionDataRaw as MissionRow[] | null;

    // Calculate milestone stats
    const milestoneStats: Record<
      string,
      { completed: number; totalDays: number; count: number }
    > = {
      [MISSION_TEMPLATES.ceremony]: { completed: 0, totalDays: 0, count: 0 },
      [MISSION_TEMPLATES.celebration]: { completed: 0, totalDays: 0, count: 0 },
      [MISSION_TEMPLATES.photography]: { completed: 0, totalDays: 0, count: 0 },
    };

    for (const mission of missionData || []) {
      if (
        mission.status === "COMPLETED" &&
        milestoneStats[mission.template_id]
      ) {
        milestoneStats[mission.template_id].completed++;
        const createdAt = new Date(mission.created_at);
        const updatedAt = new Date(mission.updated_at);
        const daysDiff = Math.ceil(
          (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        milestoneStats[mission.template_id].totalDays += daysDiff;
        milestoneStats[mission.template_id].count++;
      }
    }

    const milestones: JourneyMilestone[] = [
      {
        milestone: "ceremony_venue",
        milestoneName: "Ceremony Venue",
        completedCount: milestoneStats[MISSION_TEMPLATES.ceremony].completed,
        totalEligible: totalWeddings,
        completionRate:
          totalWeddings > 0
            ? Math.round(
                (milestoneStats[MISSION_TEMPLATES.ceremony].completed /
                  totalWeddings) *
                  10000
              ) / 100
            : 0,
        avgDaysToComplete:
          milestoneStats[MISSION_TEMPLATES.ceremony].count > 0
            ? Math.round(
                milestoneStats[MISSION_TEMPLATES.ceremony].totalDays /
                  milestoneStats[MISSION_TEMPLATES.ceremony].count
              )
            : null,
      },
      {
        milestone: "celebration_venue",
        milestoneName: "Celebration Venue",
        completedCount: milestoneStats[MISSION_TEMPLATES.celebration].completed,
        totalEligible: totalWeddings,
        completionRate:
          totalWeddings > 0
            ? Math.round(
                (milestoneStats[MISSION_TEMPLATES.celebration].completed /
                  totalWeddings) *
                  10000
              ) / 100
            : 0,
        avgDaysToComplete:
          milestoneStats[MISSION_TEMPLATES.celebration].count > 0
            ? Math.round(
                milestoneStats[MISSION_TEMPLATES.celebration].totalDays /
                  milestoneStats[MISSION_TEMPLATES.celebration].count
              )
            : null,
      },
      {
        milestone: "photography",
        milestoneName: "Photography",
        completedCount: milestoneStats[MISSION_TEMPLATES.photography].completed,
        totalEligible: totalWeddings,
        completionRate:
          totalWeddings > 0
            ? Math.round(
                (milestoneStats[MISSION_TEMPLATES.photography].completed /
                  totalWeddings) *
                  10000
              ) / 100
            : 0,
        avgDaysToComplete:
          milestoneStats[MISSION_TEMPLATES.photography].count > 0
            ? Math.round(
                milestoneStats[MISSION_TEMPLATES.photography].totalDays /
                  milestoneStats[MISSION_TEMPLATES.photography].count
              )
            : null,
      },
    ];

    return {
      milestones,
      totalWeddings,
    };
  }

  async getTimeline(
    startDate: Date,
    endDate: Date
  ): Promise<JourneyTimelineResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get daily registrations
    const { data: regDataRaw, error: regError } = await supabase.client
      .from("wedders")
      .select("created_at")
      .gte("created_at", startISO)
      .lte("created_at", endISO)
      .order("created_at", { ascending: true });

    if (regError) throw regError;
    const regData = regDataRaw as { created_at: string }[] | null;

    // Get daily wedding creations
    const { data: wedDataRaw, error: wedError } = await supabase.client
      .from("weddings")
      .select("created_at")
      .gte("created_at", startISO)
      .lte("created_at", endISO)
      .order("created_at", { ascending: true });

    if (wedError) throw wedError;
    const wedData = wedDataRaw as { created_at: string }[] | null;

    // Get daily onboarding completions
    const { data: onbDataRaw, error: onbError } = await supabase.client
      .from("onboarding_sessions")
      .select("completed_at")
      .not("completed_at", "is", null)
      .gte("completed_at", startISO)
      .lte("completed_at", endISO)
      .order("completed_at", { ascending: true });

    if (onbError) throw onbError;
    const onbData = onbDataRaw as { completed_at: string | null }[] | null;

    // Get daily tutorial completions
    const { data: tutDataRaw, error: tutError } = await supabase.client
      .from("wedder_answers")
      .select("answered_at")
      .in("question_id", [
        "ceremony_venue_booked",
        "venue_search_started",
        "photographer_booked",
      ])
      .gte("answered_at", startISO)
      .lte("answered_at", endISO)
      .order("answered_at", { ascending: true });

    if (tutError) throw tutError;
    const tutData = tutDataRaw as { answered_at: string }[] | null;

    // Aggregate by date
    const dateMap = new Map<string, JourneyTimelinePoint>();

    const addToDate = (
      dateStr: string,
      field: keyof Omit<JourneyTimelinePoint, "date">
    ) => {
      const date = dateStr.split("T")[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          registrations: 0,
          weddingsCreated: 0,
          onboardingCompleted: 0,
          tutorialCompleted: 0,
        });
      }
      dateMap.get(date)![field]++;
    };

    for (const r of regData || []) {
      addToDate(r.created_at, "registrations");
    }
    for (const w of wedData || []) {
      addToDate(w.created_at, "weddingsCreated");
    }
    for (const o of onbData || []) {
      if (o.completed_at) addToDate(o.completed_at, "onboardingCompleted");
    }
    for (const t of tutData || []) {
      if (t.answered_at) addToDate(t.answered_at, "tutorialCompleted");
    }

    const data = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const totals = {
      registrations: regData?.length || 0,
      weddingsCreated: wedData?.length || 0,
      onboardingCompleted: onbData?.length || 0,
      tutorialCompleted: tutData?.length || 0,
    };

    return { data, totals };
  }
}
