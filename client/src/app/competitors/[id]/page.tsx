"use client";

/**
 * Competitor Detail Page
 *
 * Shows detailed information about a specific competitor.
 */

import { useParams, notFound } from "next/navigation";
import { CompetitorDetailView } from "@/wedded/components/competitors";
import { getCompetitorDetail } from "@/wedded/data/competitors";

export default function CompetitorDetailPage() {
  const params = useParams();
  const competitorId = params.id as string;

  const competitor = getCompetitorDetail(competitorId);

  if (!competitor) {
    notFound();
  }

  return <CompetitorDetailView competitor={competitor} />;
}
