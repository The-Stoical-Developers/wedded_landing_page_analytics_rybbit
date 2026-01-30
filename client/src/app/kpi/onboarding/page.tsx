"use client";

/**
 * Onboarding KPI Page
 *
 * Detailed onboarding funnel, time analysis, drop-offs, and entry points.
 */

import { useState, useMemo } from "react";
import {
  UserCheck,
  CheckCircle,
  Target,
  Clock,
  AlertCircle,
  ChevronDown,
  Store,
} from "lucide-react";
import {
  useOnboardingKPIs,
  useEntryPoints,
  useCustomCombination,
} from "@/wedded/api/hooks";
import {
  KPICard,
  KPIGrid,
  KPISection,
  KPIFunnel,
  EntryPointsChart,
  CombinationBuilder,
} from "@/wedded/components";
import { KPIDateSelector } from "../components/KPIDateSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_QUESTION_IDS = [
  "ceremony_venue_booked",
  "venue_search_started",
  "photographer_booked",
];

export default function OnboardingKPIPage() {
  const [dateRange, setDateRange] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const [selectedQuestionIds, setSelectedQuestionIds] =
    useState<string[]>(DEFAULT_QUESTION_IDS);
  const [combinationBuilderIds, setCombinationBuilderIds] = useState<string[]>(
    []
  );

  const { data, isLoading } = useOnboardingKPIs(dateRange);

  // Entry points params with selected questions
  const entryPointsParams = useMemo(
    () => ({
      ...dateRange,
      questionIds: selectedQuestionIds.join(","),
    }),
    [dateRange, selectedQuestionIds]
  );

  const { data: entryPointsData, isLoading: entryPointsLoading } =
    useEntryPoints(entryPointsParams);

  // Custom combination params - only when questions are selected
  const combinationParams = useMemo(() => {
    if (combinationBuilderIds.length === 0) return null;
    return {
      ...dateRange,
      questionIds: combinationBuilderIds.join(","),
    };
  }, [dateRange, combinationBuilderIds]);

  const { data: customCombinationData, isLoading: combinationLoading } =
    useCustomCombination(combinationParams);

  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const handleQuestionToggle = (questionId: string) => {
    const isSelected = selectedQuestionIds.includes(questionId);
    if (isSelected) {
      // Don't allow deselecting all questions
      if (selectedQuestionIds.length > 1) {
        setSelectedQuestionIds(
          selectedQuestionIds.filter((id) => id !== questionId)
        );
      }
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, questionId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Onboarding Analytics
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            User activation and funnel conversion
          </p>
        </div>
        <KPIDateSelector onDateChange={handleDateChange} />
      </div>

      {/* Overview Cards */}
      <KPISection title="Overview" icon={<UserCheck className="w-4 h-4" />}>
        <KPIGrid columns={4}>
          <KPICard
            title="Started"
            value={data?.summary.started ?? 0}
            icon={<UserCheck className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/onboarding/started"
            tooltip="Users who started onboarding"
          />
          <KPICard
            title="Completed"
            value={data?.summary.completed ?? 0}
            icon={<CheckCircle className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/onboarding/completed"
            tooltip="Users who completed onboarding"
          />
          <KPICard
            title="Completion Rate"
            value={data?.summary.completionRate ?? 0}
            suffix="%"
            icon={<Target className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/onboarding/completion-rate"
            tooltip="Percentage of users completing onboarding"
          />
          <KPICard
            title="Avg. Time"
            value={Math.round((data?.timeAnalysis.avgDuration ?? 0) / 60)}
            suffix=" min"
            icon={<Clock className="w-5 h-5" />}
            isLoading={isLoading}
            href="/kpi/onboarding/avg-time"
            tooltip="Average time to complete onboarding"
          />
        </KPIGrid>
      </KPISection>

      {/* Funnel and Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4" />
              Onboarding Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KPIFunnel stages={data?.funnel || []} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Time by Phase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Time by Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.timeAnalysis.byPhase.map((phase) => (
                  <div
                    key={phase.phase}
                    className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {phase.phaseName}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatDuration(phase.avgDuration)}
                        </span>
                        <span className="text-xs text-neutral-400 ml-1">
                          avg
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400 w-16 text-right">
                        n={phase.sampleSize}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drop-offs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-4 h-4" />
            Top Drop-off Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                </div>
              ))}
            </div>
          ) : data?.dropOffs.topQuestions.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No drop-offs in selected period
            </p>
          ) : (
            <div className="space-y-3">
              {data?.dropOffs.topQuestions.map((question, index) => (
                <div
                  key={question.questionId}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 font-mono">
                      {question.questionId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {question.dropOffCount} users
                    </span>
                    <span className="text-xs text-red-500">
                      {question.dropOffRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Points Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Store className="w-5 h-5" />
              Punto de Entrada de Parejas
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Que vendors tienen cerrados las parejas al crear su boda
            </p>
          </div>

          {/* Question selector */}
          <div className="relative">
            <details className="group">
              <summary className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedQuestionIds.length} vendors seleccionados
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 p-2 max-h-80 overflow-y-auto">
                {/* Group by phase */}
                {["PHASE_CEREMONY", "PHASE_CELEBRATION"].map((phase) => (
                  <div key={phase} className="mb-2">
                    <div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase">
                      {phase === "PHASE_CEREMONY" ? "Ceremonia" : "Celebracion"}
                    </div>
                    {entryPointsData?.availableQuestions
                      .filter((q) => q.phase === phase)
                      .map((question) => {
                        const isSelected = selectedQuestionIds.includes(
                          question.id
                        );
                        return (
                          <button
                            key={question.id}
                            onClick={() => handleQuestionToggle(question.id)}
                            className={`
                              w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left
                              transition-colors
                              ${
                                isSelected
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                              }
                            `}
                          >
                            <div
                              className={`
                                w-4 h-4 rounded border flex items-center justify-center
                                ${
                                  isSelected
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-neutral-400 dark:border-neutral-600"
                                }
                              `}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <span>{question.label}</span>
                          </button>
                        );
                      })}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* Entry Points Chart */}
        {entryPointsData && (
          <EntryPointsChart
            byQuestion={entryPointsData.data.byQuestion}
            combinations={entryPointsData.data.combinations}
            totalWeddings={entryPointsData.data.totalWeddings}
            selectedQuestions={selectedQuestionIds}
            availableQuestions={entryPointsData.availableQuestions}
            isLoading={entryPointsLoading}
          />
        )}

        {!entryPointsData && entryPointsLoading && (
          <EntryPointsChart
            byQuestion={{}}
            combinations={[]}
            totalWeddings={0}
            selectedQuestions={[]}
            availableQuestions={[]}
            isLoading={true}
          />
        )}

        {/* Combination Builder */}
        {entryPointsData && (
          <CombinationBuilder
            availableQuestions={entryPointsData.availableQuestions}
            selectedIds={combinationBuilderIds}
            result={customCombinationData?.data ?? null}
            isLoading={combinationLoading}
            onSelectionChange={setCombinationBuilderIds}
          />
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}
