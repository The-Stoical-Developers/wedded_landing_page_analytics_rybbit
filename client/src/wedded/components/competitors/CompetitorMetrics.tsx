'use client';

import { motion } from 'framer-motion';
import { Users, Globe, Store, Heart, Smartphone, TrendingUp } from 'lucide-react';
import { type CompetitorDetail } from '../../data/competitors';

interface CompetitorMetricsProps {
  competitor: CompetitorDetail;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  return (
    <motion.div
      variants={item}
      className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4"
    >
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">{label}</div>
      <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{value}</div>
    </motion.div>
  );
}

export function CompetitorMetrics({ competitor }: CompetitorMetricsProps) {
  const { metrics } = competitor;

  // Collect available metrics
  const metricItems: MetricCardProps[] = [];

  if (metrics.users) {
    metricItems.push({
      icon: <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      label: 'Users',
      value: metrics.users,
      color: 'bg-emerald-100 dark:bg-emerald-900/30',
    });
  }

  if (metrics.monthlyVisitors) {
    metricItems.push({
      icon: <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      label: 'Monthly Visitors',
      value: metrics.monthlyVisitors,
      color: 'bg-blue-100 dark:bg-blue-900/30',
    });
  }

  if (metrics.vendors) {
    metricItems.push({
      icon: <Store className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      label: 'Vendors',
      value: metrics.vendors,
      color: 'bg-amber-100 dark:bg-amber-900/30',
    });
  }

  if (metrics.weddingsPerYear) {
    metricItems.push({
      icon: <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />,
      label: 'Weddings/Year',
      value: metrics.weddingsPerYear,
      color: 'bg-red-100 dark:bg-red-900/30',
    });
  }

  if (metrics.appDownloads) {
    metricItems.push({
      icon: <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      label: 'App Downloads',
      value: metrics.appDownloads,
      color: 'bg-purple-100 dark:bg-purple-900/30',
    });
  }

  if (metrics.marketShare) {
    metricItems.push({
      icon: <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      label: 'Market Share',
      value: metrics.marketShare,
      color: 'bg-cyan-100 dark:bg-cyan-900/30',
    });
  }

  // Add revenue if available from base competitor
  if (competitor.revenue) {
    metricItems.push({
      icon: <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      label: 'Revenue',
      value: competitor.revenue,
      color: 'bg-amber-100 dark:bg-amber-900/30',
    });
  }

  if (metricItems.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
    >
      {metricItems.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </motion.div>
  );
}
