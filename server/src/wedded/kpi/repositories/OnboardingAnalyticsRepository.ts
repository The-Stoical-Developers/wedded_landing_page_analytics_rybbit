/**
 * Onboarding Analytics Repository
 *
 * Provides onboarding funnel, time analysis, and drop-off data from PostgreSQL.
 */

import { query, queryCount } from "./queryHelper.js";
import {
  OnboardingAnalyticsRepository,
  FunnelStage,
  TimeAnalysisResult,
  PhaseTimeAnalysis,
  DropOffsResult,
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

// Last questions of each phase - if user answered these, they completed the phase
const PHASE_FINAL_QUESTIONS = new Set([
  "couple_type",
  "already_engaged",
  "proposal_assistant",
  "engagement_family_celebration",
  "car_rental_needed",
  "barra_libre",
  "guest_invitation_digital_or_physical",
]);

interface OnboardingSessionRow {
  created_at: string;
  completed_at: string | null;
}

interface WedderAnswerRow {
  wedding_id: string;
  phase: string;
  answered_at: string;
}

export class PgOnboardingAnalyticsRepository
  implements OnboardingAnalyticsRepository
{
  async getFunnel(startDate: Date, endDate: Date): Promise<FunnelStage[]> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get total onboarding sessions in the date range
    const total = await queryCount(
      'SELECT COUNT(*) FROM public.onboarding_sessions WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    // Get counts for each completed phase
    const phaseCounts: number[] = [];

    for (const phase of ONBOARDING_PHASES) {
      const count = await queryCount(
        'SELECT COUNT(*) FROM public.onboarding_sessions WHERE created_at >= $1 AND created_at <= $2 AND completed_phases @> $3::text[]',
        [startISO, endISO, [phase]]
      );
      phaseCounts.push(count);
    }

    // Build funnel stages
    const stages: FunnelStage[] = [
      {
        stage: "weddings_created",
        stageName: "Bodas creadas",
        count: total,
        conversionRate: 100,
        dropOffRate: 0,
      },
    ];

    const phaseNames = [
      "Info",
      "Engagement",
      "Ceremony",
      "Celebration",
      "Guests",
    ];

    for (let i = 0; i < ONBOARDING_PHASES.length; i++) {
      const count = phaseCounts[i];
      const previousCount = i === 0 ? total : phaseCounts[i - 1];

      const conversionRate =
        total > 0 ? Math.round((count / total) * 10000) / 100 : 0;

      const dropOffRate =
        previousCount > 0
          ? Math.round(((previousCount - count) / previousCount) * 10000) / 100
          : 0;

      stages.push({
        stage: ONBOARDING_PHASES[i],
        stageName: phaseNames[i],
        count,
        conversionRate,
        dropOffRate,
      });
    }

    return stages;
  }

  async getTimeAnalysis(
    startDate: Date,
    endDate: Date
  ): Promise<TimeAnalysisResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get all completed onboarding sessions with timestamps
    const sessions = await query<OnboardingSessionRow>(
      'SELECT created_at, completed_at FROM public.onboarding_sessions WHERE completed_at IS NOT NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    if (sessions.length === 0) {
      return {
        avgDuration: 0,
        medianDuration: 0,
        p90Duration: 0,
        unit: "seconds",
        sampleSize: 0,
        byPhase: [],
      };
    }

    // Calculate durations in seconds
    const durations = sessions
      .map((s) => {
        const start = new Date(s.created_at).getTime();
        const end = new Date(s.completed_at!).getTime();
        return Math.round((end - start) / 1000);
      })
      .filter((d) => d > 0)
      .sort((a, b) => a - b);

    if (durations.length === 0) {
      return {
        avgDuration: 0,
        medianDuration: 0,
        p90Duration: 0,
        unit: "seconds",
        sampleSize: 0,
        byPhase: [],
      };
    }

    // Calculate statistics
    const avg = Math.round(
      durations.reduce((sum, d) => sum + d, 0) / durations.length
    );
    const median = durations[Math.floor(durations.length / 2)];
    const p90Index = Math.floor(durations.length * 0.9);
    const p90 = durations[Math.min(p90Index, durations.length - 1)];

    // Get per-phase timing
    const byPhase = await this.getPhaseTimeAnalysis(startISO, endISO);

    return {
      avgDuration: avg,
      medianDuration: median,
      p90Duration: p90,
      unit: "seconds",
      sampleSize: durations.length,
      byPhase,
    };
  }

  private async getPhaseTimeAnalysis(
    startISO: string,
    endISO: string
  ): Promise<PhaseTimeAnalysis[]> {
    // Initialize all phases with default values
    const result: PhaseTimeAnalysis[] = ONBOARDING_PHASES.map((phase) => ({
      phase,
      phaseName: PHASE_NAMES[phase],
      avgDuration: 0,
      medianDuration: 0,
      p90Duration: 0,
      sampleSize: 0,
    }));

    const answers = await query<WedderAnswerRow>(
      'SELECT wedding_id, phase, answered_at FROM public.wedder_answers WHERE answered_at IS NOT NULL AND deleted_at IS NULL AND answered_at >= $1 AND answered_at <= $2',
      [startISO, endISO]
    );

    if (answers.length === 0) {
      return result; // Return all 5 phases with sampleSize: 0
    }

    // Group answers by phase -> wedding_id -> timestamps
    const phaseWeddingTimestamps = new Map<string, Map<string, number[]>>();
    for (const phase of ONBOARDING_PHASES) {
      phaseWeddingTimestamps.set(phase, new Map());
    }

    for (const answer of answers) {
      const phaseMap = phaseWeddingTimestamps.get(answer.phase);
      if (!phaseMap) continue;

      const timestamps = phaseMap.get(answer.wedding_id) || [];
      timestamps.push(new Date(answer.answered_at).getTime());
      phaseMap.set(answer.wedding_id, timestamps);
    }

    // Calculate duration per phase and update the result array
    for (let i = 0; i < ONBOARDING_PHASES.length; i++) {
      const phase = ONBOARDING_PHASES[i];
      const weddingTimestamps = phaseWeddingTimestamps.get(phase)!;
      const durations: number[] = [];

      for (const [, timestamps] of weddingTimestamps) {
        if (timestamps.length < 2) continue;

        const minTs = Math.min(...timestamps);
        const maxTs = Math.max(...timestamps);
        const durationSeconds = Math.round((maxTs - minTs) / 1000);

        if (durationSeconds > 0) {
          durations.push(durationSeconds);
        }
      }

      if (durations.length === 0) {
        // Keep the default values already set in result[i]
        continue;
      }

      durations.sort((a, b) => a - b);
      const avg = Math.round(
        durations.reduce((sum, d) => sum + d, 0) / durations.length
      );
      const median = durations[Math.floor(durations.length / 2)];
      const p90Index = Math.floor(durations.length * 0.9);
      const p90 = durations[Math.min(p90Index, durations.length - 1)];

      // Update the existing entry in result
      result[i] = {
        phase,
        phaseName: PHASE_NAMES[phase],
        avgDuration: avg,
        medianDuration: median,
        p90Duration: p90,
        sampleSize: durations.length,
      };
    }

    return result;
  }

  async getDropOffs(startDate: Date, endDate: Date): Promise<DropOffsResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get total onboarding sessions
    const totalStarted = await queryCount(
      'SELECT COUNT(*) FROM public.onboarding_sessions WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    // Get incomplete sessions
    const incompleteSessions = await query<{ wedding_id: string }>(
      'SELECT wedding_id FROM public.onboarding_sessions WHERE completed_at IS NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const incompleteWeddingIds = incompleteSessions.map(
      (s) => s.wedding_id
    );
    const totalDropOffs = incompleteWeddingIds.length;

    if (totalDropOffs === 0) {
      return {
        topQuestions: [],
        totalDropOffs: 0,
        totalStarted,
      };
    }

    // Get all answers for incomplete weddings
    const answers = await query<{ wedding_id: string; question_id: string; answered_at: string }>(
      'SELECT wedding_id, question_id, answered_at FROM public.wedder_answers WHERE wedding_id = ANY($1::uuid[]) AND answered_at IS NOT NULL ORDER BY answered_at DESC',
      [incompleteWeddingIds]
    );

    if (answers.length === 0) {
      return {
        topQuestions: [],
        totalDropOffs,
        totalStarted,
      };
    }

    // Find last question per wedding
    const lastQuestionPerWedding = new Map<string, string>();
    for (const answer of answers) {
      if (!lastQuestionPerWedding.has(answer.wedding_id)) {
        lastQuestionPerWedding.set(answer.wedding_id, answer.question_id);
      }
    }

    // Count drop-offs per question
    const dropOffCounts = new Map<string, number>();
    for (const [, questionId] of lastQuestionPerWedding) {
      if (!PHASE_FINAL_QUESTIONS.has(questionId)) {
        dropOffCounts.set(questionId, (dropOffCounts.get(questionId) || 0) + 1);
      }
    }

    // Sort by count and get top 5
    const sorted = Array.from(dropOffCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topQuestions = sorted.map(([questionId, count]) => ({
      questionId,
      dropOffCount: count,
      dropOffRate:
        totalDropOffs > 0
          ? Math.round((count / totalDropOffs) * 10000) / 100
          : 0,
    }));

    return {
      topQuestions,
      totalDropOffs,
      totalStarted,
    };
  }
}
