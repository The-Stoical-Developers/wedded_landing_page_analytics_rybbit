"use client";

/**
 * Combination Builder Component
 *
 * Allows users to select multiple vendors and see how many weddings
 * have ALL of them booked.
 */

import { Calculator, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EntryPointQuestion, CustomCombinationResult } from "../api/endpoints/types";

interface CombinationBuilderProps {
  availableQuestions: EntryPointQuestion[];
  selectedIds: string[];
  result: CustomCombinationResult | null;
  isLoading: boolean;
  onSelectionChange: (ids: string[]) => void;
}

export function CombinationBuilder({
  availableQuestions,
  selectedIds,
  result,
  isLoading,
  onSelectionChange,
}: CombinationBuilderProps) {
  const handleToggle = (questionId: string) => {
    const isSelected = selectedIds.includes(questionId);
    if (isSelected) {
      onSelectionChange(selectedIds.filter((id) => id !== questionId));
    } else {
      onSelectionChange([...selectedIds, questionId]);
    }
  };

  const getQuestionLabel = (questionId: string) => {
    return availableQuestions.find((q) => q.id === questionId)?.label || questionId;
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
          <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Constructor de Combinaciones
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Selecciona los vendors que quieres analizar juntos
          </p>
        </div>
      </div>

      {/* Question checkboxes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        {availableQuestions.map((question) => {
          const isSelected = selectedIds.includes(question.id);
          return (
            <button
              key={question.id}
              onClick={() => handleToggle(question.id)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all duration-200 border-2",
                isSelected
                  ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                  : "bg-neutral-100 dark:bg-neutral-800 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-400"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-neutral-400 dark:border-neutral-600"
                )}
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
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="truncate">{question.label}</span>
            </button>
          );
        })}
      </div>

      {/* Result display */}
      {selectedIds.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-violet-50 dark:from-emerald-900/20 dark:to-violet-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Bodas con TODOS estos vendors cerrados:
            </span>
          </div>

          {/* Selected questions tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedIds.map((id) => (
              <span
                key={id}
                className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-full"
              >
                {getQuestionLabel(id)}
              </span>
            ))}
          </div>

          {/* Result */}
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
              <div className="w-24 h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            </div>
          ) : result ? (
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {result.matchingWeddings}
              </div>
              <div>
                <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {result.percentage}%
                </div>
                <div className="text-sm text-neutral-500">
                  de {result.totalWeddings} bodas
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {selectedIds.length === 0 && (
        <div className="text-center py-6 text-neutral-500">
          <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Selecciona uno o mas vendors para ver cuantas bodas los tienen cerrados
          </p>
        </div>
      )}
    </div>
  );
}
