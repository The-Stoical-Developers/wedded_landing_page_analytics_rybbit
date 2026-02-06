"use client";

/**
 * Onboarding KPI Page
 *
 * Detailed onboarding funnel, time analysis, drop-offs, and entry points.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserCheck,
  CheckCircle,
  Target,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
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

      {/* Drop-offs - Enhanced Visual Design */}
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 via-white to-red-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-red-950/20">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/5 to-transparent rounded-full blur-2xl" />

        {/* Header with gradient accent */}
        <div className="relative px-6 py-5 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Puntos de Abandono
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Donde los usuarios dejan el onboarding
                </p>
              </div>
            </div>
            {data?.dropOffs && data.dropOffs.totalDropOffs > 0 && (
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  {data.dropOffs.totalDropOffs}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  abandonos totales
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1">
                      <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                      <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                    </div>
                    <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.dropOffs.topQuestions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                Sin abandonos
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Todos los usuarios completaron el onboarding en este periodo
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.dropOffs.topQuestions.map((question, index) => {
                const drillDownUrl = `/kpi/drilldown/dropoff/${encodeURIComponent(question.questionId)}${
                  dateRange.startDate && dateRange.endDate
                    ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
                    : ""
                }`;
                const maxDropOff = data?.dropOffs.topQuestions[0]?.dropOffCount || 1;
                const barWidth = (question.dropOffCount / maxDropOff) * 100;

                // Gradient colors based on rank
                const gradientColors = [
                  "from-red-500 to-orange-500",
                  "from-orange-500 to-amber-500",
                  "from-amber-500 to-yellow-500",
                  "from-yellow-500 to-lime-500",
                  "from-lime-500 to-green-500",
                ];
                const gradient = gradientColors[Math.min(index, gradientColors.length - 1)];

                return (
                  <Link
                    key={question.questionId}
                    href={drillDownUrl}
                    className="group block p-4 rounded-xl bg-white/60 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-red-300 dark:hover:border-red-800 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank badge */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} shadow-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-lg font-bold text-white">
                          {index + 1}
                        </span>
                      </div>

                      {/* Question info and progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate font-mono">
                            {question.questionId}
                          </span>
                          <div className="flex items-center gap-2 ml-3">
                            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                              {question.dropOffCount}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                              {question.dropOffRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Progress bar with gradient */}
                        <div className="h-2.5 bg-neutral-200/70 dark:bg-neutral-700/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 ease-out group-hover:shadow-sm`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
