'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Calendar, XCircle, LayoutGrid } from 'lucide-react';
import { type CompetitorDetail } from '../../data/competitors';
import { weddedFeatures, featureCategories, type FeatureStatus } from '../../data/wedded-features';

interface FeatureComparisonProps {
  competitor: CompetitorDetail;
}

function getStatusIcon(status: FeatureStatus) {
  switch (status) {
    case 'live':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case 'planned':
      return <Calendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />;
  }
}

function getStatusLabel(status: FeatureStatus): string {
  switch (status) {
    case 'live':
      return 'Live';
    case 'in_progress':
      return 'In Progress';
    case 'planned':
      return 'Planned';
  }
}

function getStatusBadgeClass(status: FeatureStatus): string {
  switch (status) {
    case 'live':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
    case 'in_progress':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    case 'planned':
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';
  }
}

export function FeatureComparison({ competitor }: FeatureComparisonProps) {
  // Group features by category
  const featuresByCategory = featureCategories
    .map((category) => ({
      category,
      features: weddedFeatures.filter((f) => f.category === category.id),
    }))
    .filter((group) => group.features.length > 0);

  // Count comparison stats
  const weddedLiveFeatures = weddedFeatures.filter((f) => f.status === 'live').length;
  const competitorHasCount = competitor.featureIds.length;
  const weddedHasMoreCount = weddedFeatures.filter(
    (f) => f.status === 'live' && !competitor.featureIds.includes(f.id)
  ).length;
  const competitorHasMoreCount = competitor.featureIds.filter(
    (id) => !weddedFeatures.find((f) => f.id === id && f.status === 'live')
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Feature Comparison: Wedded vs {competitor.name}
          </h3>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{weddedLiveFeatures}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Wedded Live</div>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{competitorHasCount}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{competitor.name} Has</div>
        </div>
        <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{weddedHasMoreCount}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Wedded Advantage</div>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{competitorHasMoreCount}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Gap to Close</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-neutral-600 dark:text-neutral-400">Live</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-neutral-600 dark:text-neutral-400">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <span className="text-neutral-600 dark:text-neutral-400">Planned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
          <span className="text-neutral-600 dark:text-neutral-400">Not Available</span>
        </div>
      </div>

      {/* Feature Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">Feature</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">Wedded</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {competitor.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {featuresByCategory.map((group) => (
              <React.Fragment key={group.category.id}>
                {/* Category Header */}
                <tr className="bg-neutral-100/50 dark:bg-neutral-800/50">
                  <td
                    colSpan={3}
                    className="py-2 px-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                  >
                    {group.category.name}
                  </td>
                </tr>
                {/* Features in Category */}
                {group.features.map((feature) => {
                  const competitorHas = competitor.featureIds.includes(feature.id);

                  return (
                    <tr
                      key={feature.id}
                      className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">{feature.name}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{feature.description}</div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {getStatusIcon(feature.status)}
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${getStatusBadgeClass(
                              feature.status
                            )}`}
                          >
                            {getStatusLabel(feature.status)}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        {competitorHas ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs text-emerald-700 dark:text-emerald-400">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <XCircle className="w-4 h-4 text-red-400/50 dark:text-red-500/50" />
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">No</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
