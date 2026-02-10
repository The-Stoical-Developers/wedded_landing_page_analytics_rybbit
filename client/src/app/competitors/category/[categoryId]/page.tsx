"use client";

/**
 * Category Detail Page
 *
 * Shows detailed competitive intelligence for a specific service category.
 */

import { useParams, notFound } from "next/navigation";
import { CategoryDetailView } from "@/wedded/components/competitors";
import { getCategoryDetail } from "@/wedded/data/competitors";

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;

  const category = getCategoryDetail(categoryId);

  if (!category) {
    notFound();
  }

  return <CategoryDetailView category={category} />;
}
