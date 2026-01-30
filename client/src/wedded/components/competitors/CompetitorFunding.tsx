'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users2, Calendar } from 'lucide-react';
import { type CompetitorDetail } from '../../data/competitors';

interface CompetitorFundingProps {
  competitor: CompetitorDetail;
}

export function CompetitorFunding({ competitor }: CompetitorFundingProps) {
  const { fundingDetails } = competitor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Funding & Investors</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Raised */}
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Total Raised</span>
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{fundingDetails.totalRaised}</div>
        </div>

        {/* Valuation */}
        {fundingDetails.valuation && (
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Valuation</span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{fundingDetails.valuation}</div>
          </div>
        )}

        {/* Last Round */}
        {fundingDetails.lastRound && (
          <>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Last Round</span>
              </div>
              <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {fundingDetails.lastRound.type}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {fundingDetails.lastRound.amount} ({fundingDetails.lastRound.date})
              </div>
            </div>
          </>
        )}

        {/* Investor Count */}
        {fundingDetails.investors.length > 0 && (
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Investors</span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {fundingDetails.investors.length}
            </div>
          </div>
        )}
      </div>

      {/* Investor List */}
      {fundingDetails.investors.length > 0 && (
        <div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">Key Investors</div>
          <div className="flex flex-wrap gap-2">
            {fundingDetails.investors.map((investor, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm text-neutral-600 dark:text-neutral-400"
              >
                {investor}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
