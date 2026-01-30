'use client';

import { type CompetitorDetail } from '../../data/competitors';
import { CompetitorHeader } from './CompetitorHeader';
import { CompetitorMetrics } from './CompetitorMetrics';
import { CompetitorBusinessModel } from './CompetitorBusinessModel';
import { CompetitorFunding } from './CompetitorFunding';
import { FeatureComparison } from './FeatureComparison';
import { CompetitorAnalysis } from './CompetitorAnalysis';

interface CompetitorDetailViewProps {
  competitor: CompetitorDetail;
}

export function CompetitorDetailView({ competitor }: CompetitorDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header with back link, name, badges, and links */}
      <CompetitorHeader competitor={competitor} />

      {/* Key Metrics */}
      <CompetitorMetrics competitor={competitor} />

      {/* Business Model and Value Proposition */}
      <CompetitorBusinessModel competitor={competitor} />

      {/* Funding Details */}
      <CompetitorFunding competitor={competitor} />

      {/* Feature Comparison Table */}
      <FeatureComparison competitor={competitor} />

      {/* SWOT Analysis */}
      <CompetitorAnalysis competitor={competitor} />
    </div>
  );
}
