"use client";

/**
 * WedderCard Component
 *
 * Displays a clickable card for a wedder with basic info.
 */

import { formatDistanceToNow } from "date-fns";
import { User, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { WedderSummary } from "@/wedded/api/endpoints/types";
import { cn } from "@/lib/utils";

interface WedderCardProps {
  wedder: WedderSummary | null;
  label?: string;
  className?: string;
}

const PROVIDER_ICONS: Record<string, string> = {
  google: "G",
  apple: "",
  facebook: "f",
  email: "@",
};

const PROVIDER_COLORS: Record<string, string> = {
  google: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  apple: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  facebook: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  email: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function truncateId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function formatDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function WedderCard({ wedder, label, className }: WedderCardProps) {
  if (!wedder) {
    return (
      <div
        className={cn(
          "bg-neutral-100/50 dark:bg-neutral-800/50 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg p-4",
          className
        )}
      >
        <div className="flex items-center justify-center gap-2 text-neutral-400 dark:text-neutral-500">
          <User className="w-5 h-5" />
          <span className="text-sm">No partner linked</span>
        </div>
      </div>
    );
  }

  const provider = wedder.provider?.toLowerCase() || "email";
  const providerIcon = PROVIDER_ICONS[provider] || "@";
  const providerColor =
    PROVIDER_COLORS[provider] || PROVIDER_COLORS.email;

  return (
    <Link
      href={`/kpi/wedders/${wedder.id}`}
      className={cn(
        "block bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4",
        "hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <User className="w-5 h-5" />
          </div>

          <div>
            {/* Label */}
            {label && (
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {label}
              </span>
            )}

            {/* Name or ID */}
            <div className="flex items-center gap-2 mt-0.5">
              {wedder.name ? (
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {wedder.name}
                </span>
              ) : (
                <code className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
                  {truncateId(wedder.id)}
                </code>
              )}
            </div>

            {/* Details */}
            <div className="flex items-center gap-3 mt-2">
              {/* Country */}
              {wedder.countryCode && (
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <MapPin className="w-3 h-3" />
                  {wedder.countryCode}
                </span>
              )}

              {/* Provider */}
              <span
                className={cn(
                  "inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full",
                  providerColor
                )}
              >
                {providerIcon}
              </span>

              {/* Created */}
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {formatDate(wedder.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-neutral-400 mt-1" />
      </div>
    </Link>
  );
}
