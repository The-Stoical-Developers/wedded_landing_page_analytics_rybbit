"use client";

/**
 * KPIUsersList Component
 *
 * Container component that handles pagination, search, and data fetching
 * for the list of users in KPI pages.
 */

import { useState } from "react";
import { Users } from "lucide-react";
import { useWeddersList } from "@/wedded/api/hooks";
import { WeddersTable } from "@/wedded/components";

interface KPIUsersListProps {
  title?: string;
  description?: string;
}

export function KPIUsersList({
  title = "All Users",
  description = "Browse and search through all registered users",
}: KPIUsersListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 20;

  const { data, isLoading } = useWeddersList({
    page,
    pageSize,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        </div>
      </div>

      {/* Table */}
      <WeddersTable
        wedders={data?.wedders ?? []}
        total={data?.total ?? 0}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? pageSize}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        search={search}
      />
    </div>
  );
}
