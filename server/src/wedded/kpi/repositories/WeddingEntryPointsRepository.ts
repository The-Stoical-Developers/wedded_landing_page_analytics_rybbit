/**
 * Wedding Entry Points Repository
 *
 * Provides data about which vendors couples have booked when creating their wedding.
 */

import { supabase } from "../../supabase.js";
import {
  EntryPointQuestion,
  AVAILABLE_ENTRY_POINT_QUESTIONS,
  DEFAULT_ENTRY_POINT_QUESTION_IDS,
  getQuestionsByIds,
} from "../EntryPointQuestions.js";

// Types
export interface QuestionMetric {
  questionId: string;
  label: string;
  hasBooked: number;
  hasBookedRate: number;
  responses: Record<string, number>;
}

export interface CombinationMetric {
  combination: string[];
  count: number;
  percentage: number;
  label: string;
}

export interface EntryPointsResult {
  totalWeddings: number;
  byQuestion: Record<string, QuestionMetric>;
  combinations: CombinationMetric[];
}

export interface CustomCombinationResult {
  selectedQuestions: string[];
  matchingWeddings: number;
  percentage: number;
  totalWeddings: number;
}

export interface EntryPointsResponse {
  data: EntryPointsResult;
  availableQuestions: EntryPointQuestion[];
}

interface WedderAnswerRow {
  wedding_id: string;
  question_id: string;
  selected_response_ids: string[];
}

interface WeddingRow {
  id: string;
}

export class SupabaseWeddingEntryPointsRepository {
  async getEntryPoints(
    startDate: Date,
    endDate: Date,
    questionIds?: string[]
  ): Promise<EntryPointsResponse> {
    const questions =
      questionIds && questionIds.length > 0
        ? getQuestionsByIds(questionIds)
        : getQuestionsByIds(DEFAULT_ENTRY_POINT_QUESTION_IDS);

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get all weddings in the date range
    const { data: weddingsRaw, error: weddingsError } = await supabase.client
      .from("weddings")
      .select("id")
      .gte("created_at", startISO)
      .lte("created_at", endISO)
      .eq("archived", false);

    if (weddingsError) throw weddingsError;
    const weddings = weddingsRaw as WeddingRow[] | null;
    const weddingIds = (weddings || []).map((w) => w.id);
    const totalWeddings = weddingIds.length;

    if (totalWeddings === 0) {
      return {
        data: this.buildEmptyResult(questions),
        availableQuestions: AVAILABLE_ENTRY_POINT_QUESTIONS,
      };
    }

    // Get all relevant answers for these weddings
    const questionIdsToQuery = questions.map((q) => q.id);
    const { data: answersRaw, error: answersError } = await supabase.client
      .from("wedder_answers")
      .select("wedding_id, question_id, selected_response_ids")
      .in("wedding_id", weddingIds)
      .in("question_id", questionIdsToQuery)
      .is("deleted_at", null);

    if (answersError) throw answersError;
    const answers = answersRaw as WedderAnswerRow[] | null;

    // Build a map of wedding -> question -> responses
    const weddingAnswers = new Map<string, Map<string, string[]>>();
    for (const answer of answers || []) {
      if (!weddingAnswers.has(answer.wedding_id)) {
        weddingAnswers.set(answer.wedding_id, new Map());
      }
      weddingAnswers
        .get(answer.wedding_id)!
        .set(answer.question_id, answer.selected_response_ids);
    }

    // Calculate metrics for each question
    const byQuestion: Record<string, QuestionMetric> = {};
    for (const question of questions) {
      const metric = this.calculateQuestionMetric(
        question,
        weddingIds,
        weddingAnswers
      );
      byQuestion[question.id] = metric;
    }

    // Calculate combinations
    const combinations = this.calculateCombinations(
      questions,
      weddingIds,
      weddingAnswers,
      totalWeddings
    );

    return {
      data: {
        totalWeddings,
        byQuestion,
        combinations,
      },
      availableQuestions: AVAILABLE_ENTRY_POINT_QUESTIONS,
    };
  }

  private buildEmptyResult(questions: EntryPointQuestion[]): EntryPointsResult {
    const byQuestion: Record<string, QuestionMetric> = {};
    for (const question of questions) {
      byQuestion[question.id] = {
        questionId: question.id,
        label: question.label,
        hasBooked: 0,
        hasBookedRate: 0,
        responses: {},
      };
    }
    return {
      totalWeddings: 0,
      byQuestion,
      combinations: [
        {
          combination: [],
          count: 0,
          percentage: 0,
          label: "Sin vendors cerrados",
        },
      ],
    };
  }

  private calculateQuestionMetric(
    question: EntryPointQuestion,
    weddingIds: string[],
    weddingAnswers: Map<string, Map<string, string[]>>
  ): QuestionMetric {
    const responses: Record<string, number> = {};
    let hasBooked = 0;

    for (const weddingId of weddingIds) {
      const questionAnswers = weddingAnswers.get(weddingId);
      const answerResponses = questionAnswers?.get(question.id);

      if (answerResponses && answerResponses.length > 0) {
        // Count each response
        for (const response of answerResponses) {
          responses[response] = (responses[response] || 0) + 1;
        }

        // Check if the "booked" response is present
        if (answerResponses.includes(question.bookedResponse)) {
          hasBooked++;
        }
      } else {
        // No answer for this question
        responses["no_answer"] = (responses["no_answer"] || 0) + 1;
      }
    }

    const total = weddingIds.length;
    const hasBookedRate =
      total > 0 ? Math.round((hasBooked / total) * 10000) / 100 : 0;

    return {
      questionId: question.id,
      label: question.label,
      hasBooked,
      hasBookedRate,
      responses,
    };
  }

  private calculateCombinations(
    questions: EntryPointQuestion[],
    weddingIds: string[],
    weddingAnswers: Map<string, Map<string, string[]>>,
    totalWeddings: number
  ): CombinationMetric[] {
    // Count combinations of booked vendors
    const combinationCounts = new Map<string, number>();

    for (const weddingId of weddingIds) {
      const questionAnswers = weddingAnswers.get(weddingId);
      const bookedQuestions: string[] = [];

      for (const question of questions) {
        const answerResponses = questionAnswers?.get(question.id);
        if (
          answerResponses &&
          answerResponses.includes(question.bookedResponse)
        ) {
          bookedQuestions.push(question.id);
        }
      }

      // Sort to ensure consistent key
      bookedQuestions.sort();
      const key = JSON.stringify(bookedQuestions);
      combinationCounts.set(key, (combinationCounts.get(key) || 0) + 1);
    }

    // Convert to array and calculate percentages
    const combinations: CombinationMetric[] = [];
    for (const [key, count] of combinationCounts) {
      const combination = JSON.parse(key) as string[];
      const percentage =
        totalWeddings > 0
          ? Math.round((count / totalWeddings) * 10000) / 100
          : 0;

      combinations.push({
        combination,
        count,
        percentage,
        label: this.getCombinationLabel(combination, questions),
      });
    }

    // Sort by count descending
    combinations.sort((a, b) => b.count - a.count);

    return combinations;
  }

  private getCombinationLabel(
    combination: string[],
    questions: EntryPointQuestion[]
  ): string {
    if (combination.length === 0) {
      return "Sin vendors cerrados";
    }

    if (combination.length === questions.length) {
      return `Todos los vendors (${questions.length})`;
    }

    // Get labels for the booked questions
    const labels = combination.map((qId) => {
      const question = questions.find((q) => q.id === qId);
      return question?.label || qId;
    });

    if (labels.length === 1) {
      return `Solo ${labels[0]}`;
    }

    return labels.join(" + ");
  }

  async getCustomCombinationCount(
    startDate: Date,
    endDate: Date,
    questionIds: string[]
  ): Promise<CustomCombinationResult> {
    const questions = getQuestionsByIds(questionIds);
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get all weddings in the date range
    const { data: weddingsRaw, error: weddingsError } = await supabase.client
      .from("weddings")
      .select("id")
      .gte("created_at", startISO)
      .lte("created_at", endISO)
      .eq("archived", false);

    if (weddingsError) throw weddingsError;
    const weddings = weddingsRaw as WeddingRow[] | null;
    const weddingIds = (weddings || []).map((w) => w.id);
    const totalWeddings = weddingIds.length;

    if (totalWeddings === 0 || questions.length === 0) {
      return {
        selectedQuestions: questionIds,
        matchingWeddings: 0,
        percentage: 0,
        totalWeddings: 0,
      };
    }

    // Get all relevant answers for these weddings
    const { data: answersRaw, error: answersError } = await supabase.client
      .from("wedder_answers")
      .select("wedding_id, question_id, selected_response_ids")
      .in("wedding_id", weddingIds)
      .in("question_id", questionIds)
      .is("deleted_at", null);

    if (answersError) throw answersError;
    const answers = answersRaw as WedderAnswerRow[] | null;

    // Build a map of wedding -> question -> responses
    const weddingAnswers = new Map<string, Map<string, string[]>>();
    for (const answer of answers || []) {
      if (!weddingAnswers.has(answer.wedding_id)) {
        weddingAnswers.set(answer.wedding_id, new Map());
      }
      weddingAnswers
        .get(answer.wedding_id)!
        .set(answer.question_id, answer.selected_response_ids);
    }

    // Count weddings that have ALL selected questions with booked response
    let matchingWeddings = 0;
    for (const weddingId of weddingIds) {
      const questionAnswers = weddingAnswers.get(weddingId);
      let allBooked = true;

      for (const question of questions) {
        const answerResponses = questionAnswers?.get(question.id);
        if (
          !answerResponses ||
          !answerResponses.includes(question.bookedResponse)
        ) {
          allBooked = false;
          break;
        }
      }

      if (allBooked) {
        matchingWeddings++;
      }
    }

    const percentage =
      totalWeddings > 0
        ? Math.round((matchingWeddings / totalWeddings) * 10000) / 100
        : 0;

    return {
      selectedQuestions: questionIds,
      matchingWeddings,
      percentage,
      totalWeddings,
    };
  }
}
