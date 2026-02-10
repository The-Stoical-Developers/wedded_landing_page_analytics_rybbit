'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Shield,
  Zap,
  ChevronRight,
  Lightbulb,
  MapPin,
  Users,
  DollarSign,
  ExternalLink,
  Minus,
  ArrowDown,
  ArrowUp,
  Sparkles,
} from 'lucide-react';
import {
  type CategoryDetail,
  type Competitor,
  type CompetitorLevel,
  getCompetitorsByCategory,
  getCompetitorDetail,
} from '../../data/competitors';

interface CategoryDetailViewProps {
  category: CategoryDetail;
}

// ========================================
// HELPER COMPONENTS
// ========================================

function StatusBadge({ status }: { status: 'live' | 'development' | 'planned' }) {
  const config = {
    live: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', label: 'Live' },
    development: { bg: 'bg-amber-500/20', text: 'text-amber-500', label: 'In Development' },
    planned: { bg: 'bg-neutral-500/20', text: 'text-neutral-500', label: 'Planned' },
  };

  const { bg, text, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
      <span className={`w-2 h-2 rounded-full ${text.replace('text-', 'bg-')}`} />
      {label}
    </span>
  );
}

function ThreatBadge({ threat }: { threat: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { bg: 'bg-red-500/20', text: 'text-red-500', icon: AlertTriangle },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-500', icon: Shield },
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', icon: Zap },
  };

  const { bg, text, icon: Icon } = config[threat];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {threat.charAt(0).toUpperCase() + threat.slice(1)}
    </span>
  );
}

function LevelBadge({ level }: { level: CompetitorLevel }) {
  const config = {
    enterprise: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Enterprise' },
    scaleup: { bg: 'bg-amber-500/20', text: 'text-amber-500', label: 'Scale-up' },
    growth: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', label: 'Growth' },
    smb: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'SMB' },
    startup: { bg: 'bg-neutral-500/20', text: 'text-neutral-500', label: 'Startup' },
  };

  const { bg, text, label } = config[level];

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { bg: 'bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', label: 'High Priority' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', label: 'Medium Priority' },
    low: { bg: 'bg-neutral-500/20', text: 'text-neutral-600 dark:text-neutral-400', label: 'Low Priority' },
  };

  const { bg, text, label } = config[priority];

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

// ========================================
// SECTION COMPONENTS
// ========================================

function SWOTSection({ swot }: { swot: CategoryDetail['swot'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">SWOT Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Our Strengths</h3>
          </div>
          <ul className="space-y-2">
            {swot.strengths.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
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
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Our Weaknesses</h3>
          </div>
          <ul className="space-y-2">
            {swot.weaknesses.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Market Opportunities</h3>
          </div>
          <ul className="space-y-2">
            {swot.opportunities.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">&rarr;</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Threats */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-amber-200 dark:border-amber-800/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Threats to Watch</h3>
          </div>
          <ul className="space-y-2">
            {swot.threats.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">!</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function AdvantagesSection({ advantages }: { advantages: CategoryDetail['weddedAdvantages'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-500" />
        Where Wedded Wins
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {advantages.map((advantage, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-5"
          >
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">{advantage.title}</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{advantage.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CompetitorsInCategorySection({ categoryId }: { categoryId: string }) {
  const categoryCompetitors = getCompetitorsByCategory(categoryId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Competitors in This Category ({categoryCompetitors.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryCompetitors.map((competitor) => (
          <CompetitorMiniCard key={competitor.id} competitor={competitor} />
        ))}
      </div>
    </motion.div>
  );
}

function CompetitorMiniCard({ competitor }: { competitor: Competitor }) {
  const hasDetailPage = !!getCompetitorDetail(competitor.id);

  const cardContent = (
    <div className={`bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 transition-all ${hasDetailPage ? 'hover:border-emerald-500/50 hover:shadow-lg cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{competitor.name}</h4>
          {hasDetailPage && (
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
          )}
        </div>
        <ThreatBadge threat={competitor.threat} />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-3 h-3 text-neutral-400" />
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{competitor.country}</span>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 italic mb-3">{competitor.differentiator}</p>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <LevelBadge level={competitor.level} />
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          {competitor.funding && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {competitor.funding}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (hasDetailPage) {
    return (
      <Link href={`/competitors/${competitor.id}`} className="block group">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

function StrategiesSection({ strategies }: { strategies: CategoryDetail['competitiveStrategies'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-emerald-500" />
        How We Beat Them
      </h2>
      <div className="space-y-4">
        {strategies.map((strategy) => {
          const hasDetailPage = !!getCompetitorDetail(strategy.competitorId);

          return (
            <div
              key={strategy.competitorId}
              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">vs {strategy.competitorName}</h4>
                  {hasDetailPage && (
                    <Link
                      href={`/competitors/${strategy.competitorId}`}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      View profile <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Their weakness */}
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
                <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Their Weakness</div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{strategy.theirWeakness}</p>
              </div>

              {/* How we win */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-lg">
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">How Wedded Wins</div>
                <ul className="space-y-1.5">
                  {strategy.howWeWin.map((tactic, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 text-xs">&#10003;</span>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function OpportunitiesSection({ opportunities }: { opportunities: CategoryDetail['detailedOpportunities'] }) {
  const sorted = [...opportunities].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        Detailed Opportunities
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((opportunity, index) => (
          <div
            key={index}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 pr-2">{opportunity.title}</h4>
              <PriorityBadge priority={opportunity.priority} />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{opportunity.description}</p>
            {opportunity.marketEvidence && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 italic border-t border-neutral-200 dark:border-neutral-800 pt-3">
                {opportunity.marketEvidence}
              </p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function BlueOceanSection({ blueOcean }: { blueOcean: NonNullable<CategoryDetail['blueOcean']> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Blue Ocean Strategy</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Eliminate */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-red-200 dark:border-red-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-red-600 dark:text-red-400">Eliminate</h3>
          </div>
          <ul className="space-y-1.5">
            {blueOcean.eliminate.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 text-xs">&times;</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reduce */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-amber-200 dark:border-amber-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ArrowDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-amber-600 dark:text-amber-400">Reduce</h3>
          </div>
          <ul className="space-y-1.5">
            {blueOcean.reduce.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 text-xs">&darr;</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Raise */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ArrowUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-blue-600 dark:text-blue-400">Raise</h3>
          </div>
          <ul className="space-y-1.5">
            {blueOcean.raise.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 text-xs">&uarr;</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Create */}
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Create</h3>
          </div>
          <ul className="space-y-1.5">
            {blueOcean.create.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5 text-xs">+</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export function CategoryDetailView({ category }: CategoryDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          href="/competitors"
          className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Competitive Analysis</span>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {category.nameEs}
              </h1>
              <StatusBadge status={category.weddedStatus} />
            </div>

            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
              {category.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Market Leaders:</span>
              {category.marketLeaders.map((leader) => (
                <span
                  key={leader}
                  className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  {leader}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg max-w-sm">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Key Opportunity:</span>{' '}
                {category.opportunity}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SWOT Analysis */}
      <SWOTSection swot={category.swot} />

      {/* Where Wedded Wins */}
      <AdvantagesSection advantages={category.weddedAdvantages} />

      {/* Competitors in Category */}
      <CompetitorsInCategorySection categoryId={category.id} />

      {/* How We Beat Them */}
      <StrategiesSection strategies={category.competitiveStrategies} />

      {/* Detailed Opportunities */}
      <OpportunitiesSection opportunities={category.detailedOpportunities} />

      {/* Blue Ocean Strategy (optional) */}
      {category.blueOcean && <BlueOceanSection blueOcean={category.blueOcean} />}
    </div>
  );
}
