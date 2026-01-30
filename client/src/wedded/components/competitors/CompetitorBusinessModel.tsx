'use client';

import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Target, Users } from 'lucide-react';
import { type CompetitorDetail, type BusinessModelType } from '../../data/competitors';

interface CompetitorBusinessModelProps {
  competitor: CompetitorDetail;
}

function getBusinessModelLabel(type: BusinessModelType): string {
  const labels: Record<BusinessModelType, string> = {
    freemium: 'Freemium',
    subscription: 'Subscription',
    marketplace: 'Marketplace',
    hybrid: 'Hybrid',
    'one-time': 'One-Time Purchase',
    transaction: 'Transaction-Based',
  };
  return labels[type];
}

function getBusinessModelColor(type: BusinessModelType): string {
  const colors: Record<BusinessModelType, string> = {
    freemium: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    subscription: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    marketplace: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    hybrid: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    'one-time': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    transaction: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  };
  return colors[type];
}

export function CompetitorBusinessModel({ competitor }: CompetitorBusinessModelProps) {
  const { businessModel, valueProposition } = competitor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {/* Business Model Card */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Business Model</h3>
        </div>

        <div className="space-y-4">
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBusinessModelColor(
                businessModel.type
              )}`}
            >
              {getBusinessModelLabel(businessModel.type)}
            </span>
          </div>

          <p className="text-neutral-600 dark:text-neutral-400 text-sm">{businessModel.description}</p>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Revenue Streams</span>
            </div>
            <ul className="space-y-1.5">
              {businessModel.revenueStreams.map((stream, index) => (
                <li key={index} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400">•</span>
                  {stream}
                </li>
              ))}
            </ul>
          </div>

          {businessModel.pricing && businessModel.pricing.length > 0 && (
            <div>
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Pricing</div>
              <div className="space-y-1.5">
                {businessModel.pricing.map((price, index) => (
                  <div
                    key={index}
                    className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded px-3 py-1.5"
                  >
                    {price}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Value Proposition Card */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Value Proposition</h3>
        </div>

        <div className="space-y-4">
          <ul className="space-y-2">
            {valueProposition.points.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                <span className="text-neutral-600 dark:text-neutral-400 text-sm">{point}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Target Audience</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{valueProposition.targetAudience}</p>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Key Differentiator</div>
            <p className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">{competitor.differentiator}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
