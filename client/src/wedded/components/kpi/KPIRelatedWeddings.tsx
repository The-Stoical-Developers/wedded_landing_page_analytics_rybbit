"use client";

/**
 * KPI Related Weddings Component
 *
 * Shows a paginated table of weddings related to a specific KPI.
 * Displayed at the bottom of KPI detail pages.
 */

import { useState } from "react";
import { Heart } from "lucide-react";
import { useKPIWeddings } from "@/wedded/api/hooks";
import { WeddingsTable } from "../WeddingsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPIRelatedWeddingsProps {
  category: string;
  slug: string;
  startDate?: string;
  endDate?: string;
}

export function KPIRelatedWeddings({
  category,
  slug,
  startDate,
  endDate,
}: KPIRelatedWeddingsProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useKPIWeddings(category, slug, {
    startDate,
    endDate,
    page,
    pageSize,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="w-4 h-4" />
          Bodas Relacionadas
          {data && data.total > 0 && (
            <span className="text-sm font-normal text-neutral-500">
              ({data.total} total)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WeddingsTable
          weddings={data?.weddings ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  );
}
