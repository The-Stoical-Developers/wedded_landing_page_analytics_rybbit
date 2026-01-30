/**
 * Churn Analytics Repository
 *
 * Provides churn overview, by-stage analysis, and activity metrics from Supabase.
 */

import { supabase } from "../../supabase.js";
import {
  ChurnAnalyticsRepository,
  ChurnOverviewResult,
  ChurnByStageResult,
  StageChurn,
  UserActivityMetrics,
} from "./types.js";

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

export class SupabaseChurnAnalyticsRepository
  implements ChurnAnalyticsRepository
{
  async getOverview(
    startDate: Date,
    endDate: Date
  ): Promise<ChurnOverviewResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get total registered users in date range
    const { count: totalWedders, error: weddersError } = await supabase.client
      .from("wedders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (weddersError) throw weddersError;
    const totalUsersInPeriod = totalWedders || 0;

    // Get users who completed onboarding
    const { count: completedCount, error: completedError } =
      await supabase.client
        .from("onboarding_sessions")
        .select("*", { count: "exact", head: true })
        .not("completed_at", "is", null)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

    if (completedError) throw completedError;
    const completed = completedCount || 0;

    // Get users who started but didn't complete
    const { count: abandonedCount, error: abandonedError } =
      await supabase.client
        .from("onboarding_sessions")
        .select("*", { count: "exact", head: true })
        .is("completed_at", null)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

    if (abandonedError) throw abandonedError;
    const abandoned = abandonedCount || 0;

    // Calculate totals
    const totalOnboardingSessions = completed + abandoned;
    const neverStarted = Math.max(0, totalUsersInPeriod - totalOnboardingSessions);

    // Churn rate based on onboarding sessions
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

    // Get total onboarding sessions
    const { count: totalStarted, error: totalError } = await supabase.client
      .from("onboarding_sessions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (totalError) throw totalError;
    const totalSessions = totalStarted || 0;

    // Get count of users who completed each phase
    const phaseCounts: number[] = [];
    for (const phase of ONBOARDING_PHASES) {
      const { count, error } = await supabase.client
        .from("onboarding_sessions")
        .select("*", { count: "exact", head: true })
        .contains("completed_phases", [phase])
        .gte("created_at", startISO)
        .lte("created_at", endISO);

      if (error) throw error;
      phaseCounts.push(count || 0);
    }

    // Build stage churn data
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

    // Calculate overall stats
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
    // Use Supabase Auth Admin API to get all users
    const allUsers: { id: string; last_sign_in_at: string | null }[] = [];
    let page = 1;
    const perPage = 100;

    // Paginate through all users
    while (true) {
      const { data, error } = await supabase.client.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) throw error;
      if (!data.users || data.users.length === 0) break;

      allUsers.push(
        ...data.users.map((u) => ({
          id: u.id,
          last_sign_in_at: u.last_sign_in_at || null,
        }))
      );

      if (data.users.length < perPage) break;
      page++;
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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
    const activeRate =
      totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 10000) / 100 : 0;
    const dormantRate =
      totalUsers > 0
        ? Math.round((dormantUsers / totalUsers) * 10000) / 100
        : 0;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      dormantUsers,
      neverSignedIn,
      activeRate,
      dormantRate,
    };
  }
}
