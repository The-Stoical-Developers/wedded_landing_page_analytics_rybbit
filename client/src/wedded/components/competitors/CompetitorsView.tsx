'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Globe,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Building2,
  Users,
  DollarSign,
  ChevronRight,
  Lightbulb,
  Shield,
  Zap,
  MapPin,
  Filter,
} from 'lucide-react';
import {
  competitors,
  categories,
  marketData,
  marketGaps,
  getCompetitorsByCategory,
  getDirectCompetitors,
  getCountryStats,
  getCompetitorDetail,
  type Competitor,
  type CategoryInfo,
  type CompetitorLevel,
} from '../../data/competitors';

// ========================================
// HELPER COMPONENTS
// ========================================

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

function CompetitorCard({ competitor }: { competitor: Competitor }) {
  // Check if we have detail data for this competitor
  const hasDetailPage = !!getCompetitorDetail(competitor.id);

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{competitor.name}</h4>
            {hasDetailPage && (
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3 h-3 text-neutral-400" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{competitor.country}</span>
          </div>
        </div>
        <ThreatBadge threat={competitor.threat} />
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
        {competitor.description}
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        {competitor.funding && (
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <DollarSign className="w-3 h-3" />
            <span>{competitor.funding}</span>
          </div>
        )}
        {competitor.employees && (
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <Users className="w-3 h-3" />
            <span>{competitor.employees}</span>
          </div>
        )}
        {competitor.revenue && (
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <TrendingUp className="w-3 h-3" />
            <span>{competitor.revenue}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
        <LevelBadge level={competitor.level} />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(`https://${competitor.url}`, '_blank', 'noopener,noreferrer');
          }}
          className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Visit <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </>
  );

  if (hasDetailPage) {
    return (
      <Link href={`/competitors/${competitor.id}`} className="block group">
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5">
          {cardContent}
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 hover:border-emerald-500/50 hover:shadow-lg transition-all hover:scale-[1.02] hover:-translate-y-0.5">
      {cardContent}
    </div>
  );
}

function CategorySection({ category }: { category: CategoryInfo }) {
  const categoryCompetitors = getCompetitorsByCategory(category.id);
  const statusColors = {
    live: 'bg-emerald-500',
    development: 'bg-amber-500',
    planned: 'bg-neutral-400',
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{category.nameEs}</h3>
            <span className={`w-2 h-2 rounded-full ${statusColors[category.weddedStatus]}`} />
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{category.description}</p>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
          {categoryCompetitors.length} competitors
        </span>
      </div>

      <div className="mb-4">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Market Leaders:</div>
        <div className="flex flex-wrap gap-2">
          {category.marketLeaders.map((leader) => (
            <span
              key={leader}
              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400"
            >
              {leader}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Opportunity:</span> {category.opportunity}
          </p>
        </div>
      </div>
    </div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export function CompetitorsView() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const directCompetitors = getDirectCompetitors();
  const countryStats = getCountryStats();

  const filteredCompetitors = selectedCategory
    ? getCompetitorsByCategory(selectedCategory)
    : competitors;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Competitive Analysis
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1 md:mt-2 text-sm md:text-base">
          Market intelligence and competitor tracking
        </p>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Global Market 2024</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{marketData.globalMarket2024}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">→ {marketData.globalMarket2033} by 2033</div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">CAGR</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{marketData.cagr}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Projected growth rate</div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Total Companies</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{marketData.totalCompanies.toLocaleString()}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{marketData.companiesWithFunding} with funding</div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-red-500" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Direct Threats</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{directCompetitors.length}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">High-threat competitors</div>
        </div>
      </div>

      {/* Market Gaps / Opportunities */}
      <div
        className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 md:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Market Gaps & Opportunities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {marketGaps.filter(g => g.priority === 'high').map((gap) => (
            <div
              key={gap.id}
              className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur border border-neutral-200 dark:border-neutral-800 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{gap.title}</h4>
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs">
                  High Priority
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">{gap.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* By Category Section */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          By Service Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* By Country Section */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          By Geography
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {countryStats.map((country) => (
            <div
              key={country.code}
              className={`bg-neutral-50 dark:bg-neutral-900 border rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105 ${
                country.weddedPresence
                  ? 'border-emerald-500/50 shadow-lg'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/30'
              }`}
            >
              <div className="text-2xl mb-2">
                {country.code === 'US' && '\u{1F1FA}\u{1F1F8}'}
                {country.code === 'ES' && '\u{1F1EA}\u{1F1F8}'}
                {country.code === 'GB' && '\u{1F1EC}\u{1F1E7}'}
                {country.code === 'EU' && '\u{1F1EA}\u{1F1FA}'}
                {country.code === 'IN' && '\u{1F1EE}\u{1F1F3}'}
                {country.code === 'TW' && '\u{1F1F9}\u{1F1FC}'}
              </div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{country.name}</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{country.competitorCount}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate" title={country.marketLeader}>
                Leader: {country.marketLeader.split(' ')[0]}
              </div>
              {country.weddedPresence && (
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Wedded Active
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Direct Competitors (High Threat) */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Direct Competitors (High Threat)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {directCompetitors.map((competitor) => (
            <CompetitorCard key={competitor.id} competitor={competitor} />
          ))}
        </div>
      </div>

      {/* Category Filter + All Competitors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            All Competitors ({filteredCompetitors.length})
          </h2>

          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameEs}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCompetitors.map((competitor) => (
            <CompetitorCard key={competitor.id} competitor={competitor} />
          ))}
        </div>
      </div>
    </div>
  );
}
