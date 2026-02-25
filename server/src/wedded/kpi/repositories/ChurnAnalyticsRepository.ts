/**
 * Churn Analytics Repository
 *
 * Provides churn metrics based on user activity (last login).
 *
 * Churn Definition: Users who haven't logged in for more than 14 days.
 *
 * Activity Categories:
 * - Active: 0-7 days since last login
 * - At Risk: 7-14 days since last login
 * - Churned Recent: 14-30 days since last login
 * - Churned Dormant: 30+ days since last login
 * - Never Logged: No last_sign_in_at recorded
 */

import { query, queryCount } from "./queryHelper.js";
import {
  ChurnAnalyticsRepository,
  ChurnActivityResult,
  ChurnBreakdownResult,
  ChurnTimeMetrics,
  ChurnKPIResult,
  ChurnOverviewResult,
  ChurnByStageResult,
  StageChurn,
  UserActivityMetrics,
} from "./types.js";

// Time thresholds in milliseconds
const DAYS_MS = 24 * 60 * 60 * 1000;
const ACTIVE_THRESHOLD = 7 * DAYS_MS;
const AT_RISK_THRESHOLD = 14 * DAYS_MS;
const CHURNED_RECENT_THRESHOLD = 30 * DAYS_MS;

// Onboarding phases
const ONBOARDING_PHASES = [
  "PHASE_INFO",
  "PHASE_ENGAGEMENT",
  "PHASE_CEREMONY",
  "PHASE_CELEBRATION",
  "PHASE_GUESTS",
];

const PHASE_NAMES: Record<string, string> = {
  PHASE_INFO: "Info",
  PHASE_ENGAGEMENT: "Engagement",
  PHASE_CEREMONY: "Ceremony",
  PHASE_CELEBRATION: "Celebration",
  PHASE_GUESTS: "Guests",
};

// Tutorial completion indicator questions
const TUTORIAL_QUESTIONS = [
  "ceremony_venue_booked",
  "venue_search_started",
  "photographer_booked",
];

interface UserWithActivity {
  id: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface WeddingRow {
  id: string;
  wedder_1_id: string;
}

interface OnboardingSessionRow {
  wedding_id: string;
  completed_phases: string[];
  completed_at: string | null;
}

interface WedderAnswerRow {
  wedding_id: string;
}

type ActivityCategory = "active" | "atRisk" | "churnedRecent" | "churnedDormant" | "neverLogged";

function calculateRate(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 10000) / 100 : 0;
}

function categorizeUser(lastSignIn: string | null, now: Date): ActivityCategory {
  if (!lastSignIn) {
    return "neverLogged";
  }

  const lastSignInDate = new Date(lastSignIn);
  const timeSinceLogin = now.getTime() - lastSignInDate.getTime();

  if (timeSinceLogin <= ACTIVE_THRESHOLD) {
    return "active";
  } else if (timeSinceLogin <= AT_RISK_THRESHOLD) {
    return "atRisk";
  } else if (timeSinceLogin <= CHURNED_RECENT_THRESHOLD) {
    return "churnedRecent";
  } else {
    return "churnedDormant";
  }
}

export class PgChurnAnalyticsRepository
  implements ChurnAnalyticsRepository
{
  private async fetchAllUsers(): Promise<UserWithActivity[]> {
    return query<UserWithActivity>(
      'SELECT id, created_at, last_sign_in_at FROM auth.users'
    );
  }

  async getActivity(): Promise<ChurnActivityResult> {
    const allUsers = await this.fetchAllUsers();
    const now = new Date();

    const counts = {
      active: 0,
      atRisk: 0,
      churnedRecent: 0,
      churnedDormant: 0,
      neverLogged: 0,
    };

    for (const user of allUsers) {
      const category = categorizeUser(user.last_sign_in_at, now);
      counts[category]++;
    }

    const totalUsers = allUsers.length;
    const totalChurned = counts.churnedRecent + counts.churnedDormant;

    return {
      totalUsers,
      active: counts.active,
      atRisk: counts.atRisk,
      churnedRecent: counts.churnedRecent,
      churnedDormant: counts.churnedDormant,
      neverLogged: counts.neverLogged,
      activeRate: calculateRate(counts.active, totalUsers),
      atRiskRate: calculateRate(counts.atRisk, totalUsers),
      churnRate: calculateRate(totalChurned, totalUsers),
      churnedRecentRate: calculateRate(counts.churnedRecent, totalUsers),
      churnedDormantRate: calculateRate(counts.churnedDormant, totalUsers),
      neverLoggedRate: calculateRate(counts.neverLogged, totalUsers),
    };
  }

  async getBreakdown(): Promise<ChurnBreakdownResult> {
    const allUsers = await this.fetchAllUsers();
    const now = new Date();

    // Filter to only churned users (14+ days since last login)
    const churnedUserIds = new Set<string>();
    for (const user of allUsers) {
      const category = categorizeUser(user.last_sign_in_at, now);
      if (category === "churnedRecent" || category === "churnedDormant") {
        churnedUserIds.add(user.id);
      }
    }

    const totalChurned = churnedUserIds.size;

    if (totalChurned === 0) {
      return this.buildEmptyBreakdown();
    }

    // Get weddings created by churned users
    const weddingsData = await query<WeddingRow>(
      'SELECT id, wedder_1_id FROM public.weddings WHERE wedder_1_id = ANY($1::uuid[])',
      [Array.from(churnedUserIds)]
    );

    const weddingsByUser = new Map<string, string>();
    const churnedWeddingIds = new Set<string>();
    for (const wedding of weddingsData) {
      weddingsByUser.set(wedding.wedder_1_id, wedding.id);
      churnedWeddingIds.add(wedding.id);
    }

    // Users who never created a wedding
    const neverCreatedWedding = totalChurned - weddingsByUser.size;

    // Get onboarding sessions for churned users' weddings
    let onboardingData: OnboardingSessionRow[] = [];
    if (churnedWeddingIds.size > 0) {
      onboardingData = await query<OnboardingSessionRow>(
        'SELECT wedding_id, completed_phases, completed_at FROM public.onboarding_sessions WHERE wedding_id = ANY($1::uuid[])',
        [Array.from(churnedWeddingIds)]
      );
    }

    // Map wedding_id to onboarding status
    const onboardingByWedding = new Map<string, OnboardingSessionRow>();
    for (const session of onboardingData) {
      onboardingByWedding.set(session.wedding_id, session);
    }

    // Get tutorial answers for churned users' weddings
    let tutorialData: WedderAnswerRow[] = [];
    if (churnedWeddingIds.size > 0) {
      tutorialData = await query<WedderAnswerRow>(
        'SELECT wedding_id FROM public.wedder_answers WHERE wedding_id = ANY($1::uuid[]) AND question_id = ANY($2::text[])',
        [Array.from(churnedWeddingIds), TUTORIAL_QUESTIONS]
      );
    }

    const tutorialCompletedWeddings = new Set(
      tutorialData.map((a) => a.wedding_id)
    );

    // Categorize churned users by journey stage
    const breakdown = {
      neverCreatedWedding,
      onboardingPhaseInfo: 0,
      onboardingPhaseEngagement: 0,
      onboardingPhaseCeremony: 0,
      onboardingPhaseCelebration: 0,
      onboardingPhaseGuests: 0,
      postOnboarding: 0,
      postTutorial: 0,
    };

    for (const userId of churnedUserIds) {
      const weddingId = weddingsByUser.get(userId);
      if (!weddingId) {
        // Already counted in neverCreatedWedding
        continue;
      }

      const onboarding = onboardingByWedding.get(weddingId);
      if (!onboarding) {
        // Has wedding but no onboarding session - count as phase info
        breakdown.onboardingPhaseInfo++;
        continue;
      }

      const completedPhases = onboarding.completed_phases || [];
      const isOnboardingComplete = onboarding.completed_at !== null;
      const hasTutorial = tutorialCompletedWeddings.has(weddingId);

      if (isOnboardingComplete) {
        if (hasTutorial) {
          breakdown.postTutorial++;
        } else {
          breakdown.postOnboarding++;
        }
      } else {
        // Find last completed phase
        const lastPhaseIndex = this.findLastCompletedPhaseIndex(completedPhases);

        if (lastPhaseIndex === -1 || !completedPhases.includes("PHASE_INFO")) {
          breakdown.onboardingPhaseInfo++;
        } else if (!completedPhases.includes("PHASE_ENGAGEMENT")) {
          breakdown.onboardingPhaseEngagement++;
        } else if (!completedPhases.includes("PHASE_CEREMONY")) {
          breakdown.onboardingPhaseCeremony++;
        } else if (!completedPhases.includes("PHASE_CELEBRATION")) {
          breakdown.onboardingPhaseCelebration++;
        } else {
          breakdown.onboardingPhaseGuests++;
        }
      }
    }

    const onboardingTotal =
      breakdown.onboardingPhaseInfo +
      breakdown.onboardingPhaseEngagement +
      breakdown.onboardingPhaseCeremony +
      breakdown.onboardingPhaseCelebration +
      breakdown.onboardingPhaseGuests;

    return {
      totalChurned,
      ...breakdown,
      neverCreatedWeddingRate: calculateRate(breakdown.neverCreatedWedding, totalChurned),
      onboardingTotalRate: calculateRate(onboardingTotal, totalChurned),
      postOnboardingRate: calculateRate(breakdown.postOnboarding, totalChurned),
      postTutorialRate: calculateRate(breakdown.postTutorial, totalChurned),
    };
  }

  private findLastCompletedPhaseIndex(completedPhases: string[]): number {
    let lastIndex = -1;
    for (let i = 0; i < ONBOARDING_PHASES.length; i++) {
      if (completedPhases.includes(ONBOARDING_PHASES[i])) {
        lastIndex = i;
      }
    }
    return lastIndex;
  }

  private buildEmptyBreakdown(): ChurnBreakdownResult {
    return {
      totalChurned: 0,
      neverCreatedWedding: 0,
      onboardingPhaseInfo: 0,
      onboardingPhaseEngagement: 0,
      onboardingPhaseCeremony: 0,
      onboardingPhaseCelebration: 0,
      onboardingPhaseGuests: 0,
      postOnboarding: 0,
      postTutorial: 0,
      neverCreatedWeddingRate: 0,
      onboardingTotalRate: 0,
      postOnboardingRate: 0,
      postTutorialRate: 0,
    };
  }

  async getTimeMetrics(): Promise<ChurnTimeMetrics> {
    const allUsers = await this.fetchAllUsers();
    const now = new Date();

    // Calculate days from registration to churn for churned users
    const daysToChurn: number[] = [];

    for (const user of allUsers) {
      const category = categorizeUser(user.last_sign_in_at, now);
      if (category === "churnedRecent" || category === "churnedDormant") {
        if (user.last_sign_in_at && user.created_at) {
          const createdAt = new Date(user.created_at);
          const lastSignIn = new Date(user.last_sign_in_at);
          const days = Math.round(
            (lastSignIn.getTime() - createdAt.getTime()) / DAYS_MS
          );
          if (days >= 0) {
            daysToChurn.push(days);
          }
        }
      }
    }

    if (daysToChurn.length === 0) {
      return {
        avgDaysToChurn: null,
        medianDaysToChurn: null,
        minDaysToChurn: null,
        maxDaysToChurn: null,
      };
    }

    // Sort for median calculation
    daysToChurn.sort((a, b) => a - b);

    const sum = daysToChurn.reduce((acc, val) => acc + val, 0);
    const avg = Math.round((sum / daysToChurn.length) * 10) / 10;

    const mid = Math.floor(daysToChurn.length / 2);
    const median =
      daysToChurn.length % 2 === 0
        ? Math.round(((daysToChurn[mid - 1] + daysToChurn[mid]) / 2) * 10) / 10
        : daysToChurn[mid];

    return {
      avgDaysToChurn: avg,
      medianDaysToChurn: median,
      minDaysToChurn: daysToChurn[0],
      maxDaysToChurn: daysToChurn[daysToChurn.length - 1],
    };
  }

  async getChurnKPIs(): Promise<ChurnKPIResult> {
    // Fetch users once and reuse
    const allUsers = await this.fetchAllUsers();
    const now = new Date();

    // Calculate activity
    const activityCounts = {
      active: 0,
      atRisk: 0,
      churnedRecent: 0,
      churnedDormant: 0,
      neverLogged: 0,
    };

    const churnedUserIds = new Set<string>();
    const daysToChurn: number[] = [];

    for (const user of allUsers) {
      const category = categorizeUser(user.last_sign_in_at, now);
      activityCounts[category]++;

      if (category === "churnedRecent" || category === "churnedDormant") {
        churnedUserIds.add(user.id);

        if (user.last_sign_in_at && user.created_at) {
          const createdAt = new Date(user.created_at);
          const lastSignIn = new Date(user.last_sign_in_at);
          const days = Math.round(
            (lastSignIn.getTime() - createdAt.getTime()) / DAYS_MS
          );
          if (days >= 0) {
            daysToChurn.push(days);
          }
        }
      }
    }

    const totalUsers = allUsers.length;
    const totalChurned = activityCounts.churnedRecent + activityCounts.churnedDormant;

    // Build activity result
    const activity: ChurnActivityResult = {
      totalUsers,
      active: activityCounts.active,
      atRisk: activityCounts.atRisk,
      churnedRecent: activityCounts.churnedRecent,
      churnedDormant: activityCounts.churnedDormant,
      neverLogged: activityCounts.neverLogged,
      activeRate: calculateRate(activityCounts.active, totalUsers),
      atRiskRate: calculateRate(activityCounts.atRisk, totalUsers),
      churnRate: calculateRate(totalChurned, totalUsers),
      churnedRecentRate: calculateRate(activityCounts.churnedRecent, totalUsers),
      churnedDormantRate: calculateRate(activityCounts.churnedDormant, totalUsers),
      neverLoggedRate: calculateRate(activityCounts.neverLogged, totalUsers),
    };

    // Build breakdown (reuse churnedUserIds)
    const breakdown = await this.calculateBreakdown(churnedUserIds, totalChurned);

    // Build time metrics
    const timeMetrics = this.calculateTimeMetrics(daysToChurn);

    return { activity, breakdown, timeMetrics };
  }

  private async calculateBreakdown(
    churnedUserIds: Set<string>,
    totalChurned: number
  ): Promise<ChurnBreakdownResult> {
    if (totalChurned === 0) {
      return this.buildEmptyBreakdown();
    }

    // Get weddings created by churned users
    const weddingsData = await query<WeddingRow>(
      'SELECT id, wedder_1_id FROM public.weddings WHERE wedder_1_id = ANY($1::uuid[])',
      [Array.from(churnedUserIds)]
    );

    const weddingsByUser = new Map<string, string>();
    const churnedWeddingIds = new Set<string>();
    for (const wedding of weddingsData) {
      weddingsByUser.set(wedding.wedder_1_id, wedding.id);
      churnedWeddingIds.add(wedding.id);
    }

    const neverCreatedWedding = totalChurned - weddingsByUser.size;

    // Get onboarding sessions
    let onboardingData: OnboardingSessionRow[] = [];
    if (churnedWeddingIds.size > 0) {
      onboardingData = await query<OnboardingSessionRow>(
        'SELECT wedding_id, completed_phases, completed_at FROM public.onboarding_sessions WHERE wedding_id = ANY($1::uuid[])',
        [Array.from(churnedWeddingIds)]
      );
    }

    const onboardingByWedding = new Map<string, OnboardingSessionRow>();
    for (const session of onboardingData) {
      onboardingByWedding.set(session.wedding_id, session);
    }

    // Get tutorial answers
    let tutorialData: WedderAnswerRow[] = [];
    if (churnedWeddingIds.size > 0) {
      tutorialData = await query<WedderAnswerRow>(
        'SELECT wedding_id FROM public.wedder_answers WHERE wedding_id = ANY($1::uuid[]) AND question_id = ANY($2::text[])',
        [Array.from(churnedWeddingIds), TUTORIAL_QUESTIONS]
      );
    }

    const tutorialCompletedWeddings = new Set(
      tutorialData.map((a) => a.wedding_id)
    );

    // Categorize
    const breakdown = {
      neverCreatedWedding,
      onboardingPhaseInfo: 0,
      onboardingPhaseEngagement: 0,
      onboardingPhaseCeremony: 0,
      onboardingPhaseCelebration: 0,
      onboardingPhaseGuests: 0,
      postOnboarding: 0,
      postTutorial: 0,
    };

    for (const userId of churnedUserIds) {
      const weddingId = weddingsByUser.get(userId);
      if (!weddingId) continue;

      const onboarding = onboardingByWedding.get(weddingId);
      if (!onboarding) {
        breakdown.onboardingPhaseInfo++;
        continue;
      }

      const completedPhases = onboarding.completed_phases || [];
      const isOnboardingComplete = onboarding.completed_at !== null;
      const hasTutorial = tutorialCompletedWeddings.has(weddingId);

      if (isOnboardingComplete) {
        if (hasTutorial) {
          breakdown.postTutorial++;
        } else {
          breakdown.postOnboarding++;
        }
      } else {
        if (!completedPhases.includes("PHASE_INFO")) {
          breakdown.onboardingPhaseInfo++;
        } else if (!completedPhases.includes("PHASE_ENGAGEMENT")) {
          breakdown.onboardingPhaseEngagement++;
        } else if (!completedPhases.includes("PHASE_CEREMONY")) {
          breakdown.onboardingPhaseCeremony++;
        } else if (!completedPhases.includes("PHASE_CELEBRATION")) {
          breakdown.onboardingPhaseCelebration++;
        } else {
          breakdown.onboardingPhaseGuests++;
        }
      }
    }

    const onboardingTotal =
      breakdown.onboardingPhaseInfo +
      breakdown.onboardingPhaseEngagement +
      breakdown.onboardingPhaseCeremony +
      breakdown.onboardingPhaseCelebration +
      breakdown.onboardingPhaseGuests;

    return {
      totalChurned,
      ...breakdown,
      neverCreatedWeddingRate: calculateRate(breakdown.neverCreatedWedding, totalChurned),
      onboardingTotalRate: calculateRate(onboardingTotal, totalChurned),
      postOnboardingRate: calculateRate(breakdown.postOnboarding, totalChurned),
      postTutorialRate: calculateRate(breakdown.postTutorial, totalChurned),
    };
  }

  private calculateTimeMetrics(daysToChurn: number[]): ChurnTimeMetrics {
    if (daysToChurn.length === 0) {
      return {
        avgDaysToChurn: null,
        medianDaysToChurn: null,
        minDaysToChurn: null,
        maxDaysToChurn: null,
      };
    }

    daysToChurn.sort((a, b) => a - b);

    const sum = daysToChurn.reduce((acc, val) => acc + val, 0);
    const avg = Math.round((sum / daysToChurn.length) * 10) / 10;

    const mid = Math.floor(daysToChurn.length / 2);
    const median =
      daysToChurn.length % 2 === 0
        ? Math.round(((daysToChurn[mid - 1] + daysToChurn[mid]) / 2) * 10) / 10
        : daysToChurn[mid];

    return {
      avgDaysToChurn: avg,
      medianDaysToChurn: median,
      minDaysToChurn: daysToChurn[0],
      maxDaysToChurn: daysToChurn[daysToChurn.length - 1],
    };
  }

  // ========================================
  // LEGACY METHODS (deprecated, kept for backwards compatibility)
  // ========================================

  async getOverview(
    startDate: Date,
    endDate: Date
  ): Promise<ChurnOverviewResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const totalUsersInPeriod = await queryCount(
      'SELECT COUNT(*) FROM public.wedders WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const completed = await queryCount(
      'SELECT COUNT(*) FROM public.onboarding_sessions WHERE completed_at IS NOT NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const abandoned = await queryCount(
      'SELECT COUNT(*) FROM public.onboarding_sessions WHERE completed_at IS NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const totalOnboardingSessions = completed + abandoned;
    const neverStarted = Math.max(0, totalUsersInPeriod - totalOnboardingSessions);

    const churnRate =
      totalOnboardingSessions > 0
        ? Math.round((abandoned / totalOnboardingSessions) * 10000) / 100
        : 0;

    return {
      neverStarted,
      abandoned,
      completed,
      total: totalUsersInPeriod,
      churnRate,
    };
  }

  async getByStage(
    startDate: Date,
    endDate: Date
  ): Promise<ChurnByStageResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const totalSessions = await queryCount(
      'SELECT COUNT(*) FROM public.onboarding_sessions WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const phaseCounts: number[] = [];
    for (const phase of ONBOARDING_PHASES) {
      const count = await queryCount(
        'SELECT COUNT(*) FROM public.onboarding_sessions WHERE completed_phases @> $1::text[] AND created_at >= $2 AND created_at <= $3',
        [[phase], startISO, endISO]
      );
      phaseCounts.push(count);
    }

    const stages: StageChurn[] = [];

    for (let i = 0; i < ONBOARDING_PHASES.length; i++) {
      const phase = ONBOARDING_PHASES[i];
      const enteredCount = i === 0 ? totalSessions : phaseCounts[i - 1];
      const completedCount = phaseCounts[i];
      const churnedCount = Math.max(0, enteredCount - completedCount);
      const churnRate =
        enteredCount > 0
          ? Math.round((churnedCount / enteredCount) * 10000) / 100
          : 0;

      stages.push({
        stage: phase,
        stageName: PHASE_NAMES[phase],
        enteredCount,
        completedCount,
        churnedCount,
        churnRate,
      });
    }

    const totalCompleted = phaseCounts[phaseCounts.length - 1];
    const overallChurnRate =
      totalSessions > 0
        ? Math.round(
            ((totalSessions - totalCompleted) / totalSessions) * 10000
          ) / 100
        : 0;

    return {
      stages,
      totalStarted: totalSessions,
      totalCompleted,
      overallChurnRate,
    };
  }

  async getActivityMetrics(): Promise<UserActivityMetrics> {
    const allUsers = await this.fetchAllUsers();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * DAYS_MS);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * DAYS_MS);

    let activeUsers = 0;
    let inactiveUsers = 0;
    let dormantUsers = 0;
    let neverSignedIn = 0;

    for (const user of allUsers) {
      if (!user.last_sign_in_at) {
        neverSignedIn++;
      } else {
        const lastSignIn = new Date(user.last_sign_in_at);
        if (lastSignIn >= sevenDaysAgo) {
          activeUsers++;
        } else if (lastSignIn >= thirtyDaysAgo) {
          inactiveUsers++;
        } else {
          dormantUsers++;
        }
      }
    }

    const totalUsers = allUsers.length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      dormantUsers,
      neverSignedIn,
      activeRate: calculateRate(activeUsers, totalUsers),
      dormantRate: calculateRate(dormantUsers, totalUsers),
    };
  }
}
