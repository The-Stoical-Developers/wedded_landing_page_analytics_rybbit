"use client";

/**
 * WeddersTable Component
 *
 * Displays a paginated table of wedders (users) with search and filters.
 */

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Search, MapPin, Heart } from "lucide-react";
import Link from "next/link";
import { WedderListItem } from "@/wedded/api/endpoints/types";
import { cn } from "@/lib/utils";

interface WeddersTableProps {
  wedders: WedderListItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onSearch?: (search: string) => void;
  search?: string;
  baseUrl?: string;
}

const PROVIDER_ICONS: Record<string, string> = {
  google: "🔵",
  apple: "🍎",
  facebook: "📘",
  email: "📧",
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

export function WeddersTable({
  wedders,
  total,
  page,
  pageSize,
  isLoading = false,
  onPageChange,
  onSearch,
  search = "",
  baseUrl = "/kpi/wedders",
}: WeddersTableProps) {
  const [searchInput, setSearchInput] = useState(search);
  const totalPages = Math.ceil(total / pageSize);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchInput);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (e.target.value === "") {
      onSearch?.("");
    }
  };

  if (isLoading) {
    return <WeddersTableSkeleton />;
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden">
      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by user ID..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {wedders.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {search ? "No users found matching your search" : "No users found"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Auth Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Weddings
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {wedders.map((wedder) => (
                  <tr
                    key={wedder.id}
                    className="hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
                        {truncateId(wedder.id)}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDate(wedder.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {wedder.countryName ? (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {wedder.countryName}
                        </span>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-500">
                          Unknown
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {wedder.providerLabel ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span>{PROVIDER_ICONS[wedder.provider || "email"] || "📧"}</span>
                          {wedder.providerLabel}
                        </span>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-500">
                          Email
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                        {wedder.weddingsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`${baseUrl}/${wedder.id}`}
                        className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, total)} of {total} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange?.(page - 1)}
                  disabled={page <= 1}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    page <= 1
                      ? "text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => onPageChange?.(page + 1)}
                  disabled={page >= totalPages}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    page >= totalPages
                      ? "text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function WeddersTableSkeleton() {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden animate-pulse">
      {/* Search skeleton */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex gap-2">
          <div className="h-10 flex-1 max-w-md bg-neutral-200 dark:bg-neutral-700 rounded-md" />
          <div className="h-10 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/50">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4, 5, 6].map((col) => (
                  <td key={col} className="px-4 py-3">
                    <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
