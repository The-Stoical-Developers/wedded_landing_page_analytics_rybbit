"use client";

/**
 * Entry Points Chart Component
 *
 * Displays a horizontal bar chart showing which vendors couples have booked
 * when creating their wedding, along with combination statistics.
 */

import {
  Church,
  PartyPopper,
  Camera,
  Users,
  Mic,
  Music,
  Car,
  Cake,
  Sparkles,
  UserCheck,
  Scale,
  Disc,
  FileText,
  BookOpen,
  Coins,
  GemIcon,
  Heart,
  Flower2,
  Shield,
  Wine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  QuestionMetric,
  CombinationMetric,
  EntryPointQuestion,
} from "../api/endpoints/types";

interface EntryPointsChartProps {
  byQuestion: Record<string, QuestionMetric>;
  combinations: CombinationMetric[];
  totalWeddings: number;
  selectedQuestions: string[];
  availableQuestions: EntryPointQuestion[];
  isLoading?: boolean;
}

const questionIcons: Record<string, React.ReactNode> = {
  // Ceremony
  ceremony_venue_booked: <Church className="w-4 h-4" />,
  civil_expediente_done: <FileText className="w-4 h-4" />,
  canonical_expediente_done: <FileText className="w-4 h-4" />,
  ceremony_master_of_ceremony_needed: <Mic className="w-4 h-4" />,
  decide_lectures_needed: <BookOpen className="w-4 h-4" />,
  arras_needed: <Coins className="w-4 h-4" />,
  band_ceremony_needed: <Music className="w-4 h-4" />,
  ring_exchange_needed: <GemIcon className="w-4 h-4" />,
  vow_exchange_needed: <Heart className="w-4 h-4" />,
  rice_flowes_throw_needed: <Flower2 className="w-4 h-4" />,
  witnesses_needed: <Users className="w-4 h-4" />,
  bride_maid_of_honor_needed: <Users className="w-4 h-4" />,
  car_rental_needed: <Car className="w-4 h-4" />,
  // Celebration
  venue_search_started: <PartyPopper className="w-4 h-4" />,
  wedding_planner_needed: <UserCheck className="w-4 h-4" />,
  photographer_booked: <Camera className="w-4 h-4" />,
  separacion_de_bienes: <Scale className="w-4 h-4" />,
  security_staff_needed: <Shield className="w-4 h-4" />,
  photobooth_needed: <Camera className="w-4 h-4" />,
  fireworks_needed: <Sparkles className="w-4 h-4" />,
  band_music_needed: <Music className="w-4 h-4" />,
  dj_music_needed: <Disc className="w-4 h-4" />,
  dancing_instructor_needed: <Users className="w-4 h-4" />,
  bakery_needed: <Cake className="w-4 h-4" />,
  barra_libre: <Wine className="w-4 h-4" />,
};

const barColors = [
  "bg-emerald-500 dark:bg-emerald-400",
  "bg-blue-500 dark:bg-blue-400",
  "bg-violet-500 dark:bg-violet-400",
  "bg-pink-500 dark:bg-pink-400",
  "bg-amber-500 dark:bg-amber-400",
];

const bgColors = [
  "bg-emerald-500/10",
  "bg-blue-500/10",
  "bg-violet-500/10",
  "bg-pink-500/10",
  "bg-amber-500/10",
];

export function EntryPointsChart({
  byQuestion,
  combinations,
  totalWeddings,
  selectedQuestions,
  isLoading,
}: EntryPointsChartProps) {
  if (isLoading) {
    return (
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 md:p-6">
        <div className="h-5 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[80, 65, 50].map((width, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-32 h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div
                className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sort questions by hasBookedRate descending
  const sortedQuestions = Object.values(byQuestion).sort(
    (a, b) => b.hasBookedRate - a.hasBookedRate
  );

  // Sort combinations by count descending
  const sortedCombinations = [...combinations].sort((a, b) => b.count - a.count);

  // Find the max rate for scaling
  const maxRate = Math.max(...sortedQuestions.map((q) => q.hasBookedRate), 1);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Punto de Entrada de Parejas
        </h3>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-full">
            {totalWeddings} bodas
          </span>
        </div>
      </div>

      {/* Horizontal bar chart */}
      <div className="space-y-3">
        {sortedQuestions.map((metric, index) => {
          const barColor = barColors[index % barColors.length];
          const bgColor = bgColors[index % bgColors.length];
          const widthPercent = maxRate > 0 ? (metric.hasBookedRate / maxRate) * 100 : 0;

          return (
            <div key={metric.questionId} className="group">
              <div className="flex items-center gap-3">
                {/* Icon and label */}
                <div className="w-36 md:w-44 flex items-center gap-2 shrink-0">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg text-neutral-700 dark:text-neutral-300",
                      bgColor
                    )}
                  >
                    {questionIcons[metric.questionId] || (
                      <Users className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 truncate">
                    {metric.label}
                  </span>
                </div>

                {/* Bar */}
                <div className="flex-1 relative h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden">
                  <div
                    className={cn("h-full rounded-lg transition-all duration-500", barColor)}
                    style={{ width: `${Math.max(widthPercent, 2)}%` }}
                  />

                  {/* Stats overlay */}
                  <div className="absolute inset-0 flex items-center justify-end pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {metric.hasBooked}
                      </span>
                      <span className="text-[10px] text-neutral-500 bg-neutral-900/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
                        {metric.hasBookedRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Combinations section */}
      {sortedCombinations.length > 0 && (
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            Combinaciones
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sortedCombinations.slice(0, 6).map((combo, index) => (
              <div
                key={combo.label}
                className="flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
              >
                <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[60%]">
                  {combo.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {combo.count}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {combo.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
        <span>
          {selectedQuestions.length} vendor{selectedQuestions.length !== 1 ? "s" : ""}{" "}
          analizados
        </span>
        <span>
          {sortedCombinations.find((c) => c.combination.length === 0)?.percentage || 0}%
          sin vendors cerrados
        </span>
      </div>
    </div>
  );
}
