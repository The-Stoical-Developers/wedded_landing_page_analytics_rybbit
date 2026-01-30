'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';
import { type CompetitorDetail } from '../../data/competitors';

interface CompetitorAnalysisProps {
  competitor: CompetitorDetail;
}

export function CompetitorAnalysis({ competitor }: CompetitorAnalysisProps) {
  const { analysis } = competitor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Strengths */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Their Strengths</h3>
        </div>
        <ul className="space-y-2">
          {analysis.strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Their Weaknesses</h3>
        </div>
        <ul className="space-y-2">
          {analysis.weaknesses.map((weakness, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{weakness}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Opportunities (for Wedded) */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Our Opportunities</h3>
        </div>
        <ul className="space-y-2">
          {analysis.opportunities.map((opportunity, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">→</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{opportunity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Threats (to Wedded) */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-amber-200 dark:border-amber-800/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Threats to Watch</h3>
        </div>
        <ul className="space-y-2">
          {analysis.threats.map((threat, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400 mt-0.5">!</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{threat}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
