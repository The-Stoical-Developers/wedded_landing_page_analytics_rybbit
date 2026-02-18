/**
 * Journey Analytics Repository
 *
 * Provides customer journey funnel, milestones, and timeline data via direct PostgreSQL queries.
 */

import { query, queryCount } from "./queryHelper.js";
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

export class PgJourneyAnalyticsRepository
  implements JourneyAnalyticsRepository
{
  async getFunnel(
    startDate: Date,
    endDate: Date
  ): Promise<JourneyFunnelResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Stage 1: Get users registered in date range
    const weddersData = await query<WedderRow>(
      'SELECT id, created_at FROM public.wedders WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );
    const registeredUserIds = new Set(weddersData.map((w) => w.id));
    const registered = registeredUserIds.size;

    if (registered === 0) {
      return this.buildEmptyFunnel();
    }

    // Stage 2: Get weddings where wedder_1_id is in our cohort
    const weddingsData = await query<WeddingRow>(
      'SELECT id, wedder_1_id, created_at FROM public.weddings WHERE wedder_1_id = ANY($1::uuid[])',
      [Array.from(registeredUserIds)]
    );
    const cohortWeddingIds = new Set(weddingsData.map((w) => w.id));
    const weddingsCreated = cohortWeddingIds.size;

    if (weddingsCreated === 0) {
      return this.buildFunnelWithCounts([registered, 0, 0, 0, 0, 0, 0]);
    }

    // Stage 3: Onboarding completed
    const onboardingData = await query<OnboardingSessionRow>(
      'SELECT wedding_id, completed_phases, completed_at FROM public.onboarding_sessions WHERE wedding_id = ANY($1::uuid[])',
      [Array.from(cohortWeddingIds)]
    );

    const onboardingCompletedWeddings = new Set<string>();
    for (const session of onboardingData) {
      const phases = Array.isArray(session.completed_phases)
        ? session.completed_phases
        : [];
      if (phases.includes(ONBOARDING_COMPLETION_PHASE)) {
        onboardingCompletedWeddings.add(session.wedding_id);
      }
    }
    const onboardingCompleted = onboardingCompletedWeddings.size;

    // Stage 4: Tutorial completed
    const TUTORIAL_QUESTIONS = [
      "ceremony_venue_booked",
      "venue_search_started",
      "photographer_booked",
    ];
    const tutorialAnswers = await query<{ wedding_id: string }>(
      'SELECT wedding_id FROM public.wedder_answers WHERE wedding_id = ANY($1::uuid[]) AND question_id = ANY($2::text[])',
      [Array.from(onboardingCompletedWeddings), TUTORIAL_QUESTIONS]
    );
    const tutorialCompletedWeddings = new Set(
      tutorialAnswers.map((a) => a.wedding_id)
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

    const missionData = await query<{ template_id: string; wedding_id: string; status: string }>(
      'SELECT template_id, wedding_id, status FROM public.missions WHERE status = $1 AND template_id = ANY($2::text[]) AND wedding_id = ANY($3::uuid[])',
      ["COMPLETED", Object.values(MISSION_TEMPLATES), weddingIds]
    );

    const ceremonyWeddings = new Set<string>();
    const celebrationWeddings = new Set<string>();
    const photographyWeddings = new Set<string>();

    for (const mission of missionData) {
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
    const totalWeddings = await queryCount(
      'SELECT COUNT(*) FROM public.weddings WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    // Get mission completions with timing
    const missionData = await query<MissionRow>(
      'SELECT template_id, wedding_id, created_at, updated_at, status FROM public.missions WHERE template_id = ANY($1::text[]) AND created_at >= $2 AND created_at <= $3',
      [Object.values(MISSION_TEMPLATES), startISO, endISO]
    );

    // Calculate milestone stats
    const milestoneStats: Record<
      string,
      { completed: number; totalDays: number; count: number }
    > = {
      [MISSION_TEMPLATES.ceremony]: { completed: 0, totalDays: 0, count: 0 },
      [MISSION_TEMPLATES.celebration]: { completed: 0, totalDays: 0, count: 0 },
      [MISSION_TEMPLATES.photography]: { completed: 0, totalDays: 0, count: 0 },
    };

    for (const mission of missionData) {
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
    const regData = await query<{ created_at: string }>(
      'SELECT created_at FROM public.wedders WHERE created_at >= $1 AND created_at <= $2 ORDER BY created_at ASC',
      [startISO, endISO]
    );

    // Get daily wedding creations
    const wedData = await query<{ created_at: string }>(
      'SELECT created_at FROM public.weddings WHERE created_at >= $1 AND created_at <= $2 ORDER BY created_at ASC',
      [startISO, endISO]
    );

    // Get daily onboarding completions
    const onbData = await query<{ completed_at: string | null }>(
      'SELECT completed_at FROM public.onboarding_sessions WHERE completed_at IS NOT NULL AND completed_at >= $1 AND completed_at <= $2 ORDER BY completed_at ASC',
      [startISO, endISO]
    );

    // Get daily tutorial completions
    const tutData = await query<{ answered_at: string }>(
      'SELECT answered_at FROM public.wedder_answers WHERE question_id = ANY($1::text[]) AND answered_at >= $2 AND answered_at <= $3 ORDER BY answered_at ASC',
      [
        [
          "ceremony_venue_booked",
          "venue_search_started",
          "photographer_booked",
        ],
        startISO,
        endISO,
      ]
    );

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

    for (const r of regData) {
      addToDate(r.created_at, "registrations");
    }
    for (const w of wedData) {
      addToDate(w.created_at, "weddingsCreated");
    }
    for (const o of onbData) {
      if (o.completed_at) addToDate(o.completed_at, "onboardingCompleted");
    }
    for (const t of tutData) {
      if (t.answered_at) addToDate(t.answered_at, "tutorialCompleted");
    }

    const data = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const totals = {
      registrations: regData.length,
      weddingsCreated: wedData.length,
      onboardingCompleted: onbData.length,
      tutorialCompleted: tutData.length,
    };

    return { data, totals };
  }
}
