'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  AlertTriangle,
  Shield,
  Zap,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { type CompetitorDetail, type CompetitorLevel } from '../../data/competitors';

interface CompetitorHeaderProps {
  competitor: CompetitorDetail;
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
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

function ThreatBadge({ threat }: { threat: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { bg: 'bg-red-500/20', text: 'text-red-500', icon: AlertTriangle, label: 'High Threat' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-500', icon: Shield, label: 'Medium Threat' },
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', icon: Zap, label: 'Low Threat' },
  };

  const { bg, text, icon: Icon, label } = config[threat];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
}

export function CompetitorHeader({ competitor }: CompetitorHeaderProps) {
  return (
    <div className="space-y-4">
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
          <span className="text-sm">Back to Competitors</span>
        </Link>
      </motion.div>

      {/* Header Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left Side - Name and Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {competitor.name}
              </h1>
              <div className="flex items-center gap-2">
                <LevelBadge level={competitor.level} />
                <ThreatBadge threat={competitor.threat} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <MapPin className="w-4 h-4" />
              <span>{competitor.country}</span>
            </div>

            <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium italic">
              &quot;{competitor.valueProposition.headline}&quot;
            </p>

            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
              {competitor.description}
            </p>
          </div>

          {/* Right Side - Links */}
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://${competitor.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </a>

            {competitor.links.linkedin && (
              <a
                href={competitor.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}

            {competitor.links.crunchbase && (
              <a
                href={competitor.links.crunchbase}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Crunchbase
              </a>
            )}

            {competitor.links.twitter && (
              <a
                href={competitor.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
