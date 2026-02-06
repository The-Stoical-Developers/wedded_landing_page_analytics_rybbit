/**
 * Wedding Analytics Repository
 *
 * Provides wedding overview and engagement metrics from Supabase.
 */

import { supabase } from "../../supabase.js";
import {
  WeddingAnalyticsRepository,
  WeddingOverviewResult,
  WeddingEngagementResult,
  WeddingTimelineResult,
  WeddingMissionsResult,
} from "./types.js";

export class SupabaseWeddingAnalyticsRepository
  implements WeddingAnalyticsRepository
{
  async getOverview(
    startDate: Date,
    endDate: Date
  ): Promise<WeddingOverviewResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get total weddings in date range
    const { count: totalWeddings, error: totalError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (totalError) throw totalError;
    const total = totalWeddings || 0;

    // Get active weddings (not archived) in date range
    const { count: activeCount, error: activeError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (activeError) throw activeError;
    const activeWeddings = activeCount || 0;
    const archivedWeddings = total - activeWeddings;

    // Get weddings with partner
    const { count: withPartnerCount, error: partnerError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .not("wedder_2_id", "is", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (partnerError) throw partnerError;
    const withPartner = withPartnerCount || 0;
    const soloPlanning = total - withPartner;

    // Get weddings with ceremony date set
    const { count: withCeremonyDateCount, error: ceremonyDateError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .not("ceremony_date", "is", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (ceremonyDateError) throw ceremonyDateError;
    const withCeremonyDateSet = withCeremonyDateCount || 0;
    const withoutCeremonyDate = total - withCeremonyDateSet;

    // Get weddings with celebration date set
    const { count: withCelebrationDateCount, error: celebrationDateError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .not("celebration_date", "is", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (celebrationDateError) throw celebrationDateError;
    const withCelebrationDateSet = withCelebrationDateCount || 0;
    const withoutCelebrationDate = total - withCelebrationDateSet;

    // Calculate rates
    const partnerJoinRate =
      total > 0 ? Math.round((withPartner / total) * 10000) / 100 : 0;

    const ceremonyDateSetRate =
      total > 0 ? Math.round((withCeremonyDateSet / total) * 10000) / 100 : 0;

    const celebrationDateSetRate =
      total > 0 ? Math.round((withCelebrationDateSet / total) * 10000) / 100 : 0;

    return {
      totalWeddings: total,
      activeWeddings,
      archivedWeddings,
      withPartner,
      soloPlanning,
      partnerJoinRate,
      withCeremonyDateSet,
      withoutCeremonyDate,
      ceremonyDateSetRate,
      withCelebrationDateSet,
      withoutCelebrationDate,
      celebrationDateSetRate,
    };
  }

  async getEngagement(
    startDate: Date,
    endDate: Date
  ): Promise<WeddingEngagementResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get total weddings for averages
    const { count: totalWeddings, error: weddingsError } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (weddingsError) throw weddingsError;
    const weddings = totalWeddings || 0;

    // Task metrics
    const { count: totalTasks, error: totalTasksError } = await supabase.client
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (totalTasksError) throw totalTasksError;
    const totalTaskCount = totalTasks || 0;

    const { count: completedTasks, error: completedTasksError } =
      await supabase.client
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("completed", true)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

    if (completedTasksError) throw completedTasksError;
    const completedTaskCount = completedTasks || 0;

    const taskCompletionRate =
      totalTaskCount > 0
        ? Math.round((completedTaskCount / totalTaskCount) * 10000) / 100
        : 0;

    // Vendor metrics
    const { count: totalVendors, error: totalVendorsError } =
      await supabase.client
        .from("retailers_in_weddings")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

    if (totalVendorsError) throw totalVendorsError;
    const totalVendorCount = totalVendors || 0;

    const { count: savedVendors, error: savedError } = await supabase.client
      .from("retailers_in_weddings")
      .select("*", { count: "exact", head: true })
      .eq("status", "SAVED")
      .is("deleted_at", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (savedError) throw savedError;
    const savedVendorCount = savedVendors || 0;

    const { count: contactedVendors, error: contactedError } =
      await supabase.client
        .from("retailers_in_weddings")
        .select("*", { count: "exact", head: true })
        .eq("status", "CONTACTED")
        .is("deleted_at", null)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

    if (contactedError) throw contactedError;
    const contactedVendorCount = contactedVendors || 0;

    const { count: hiredVendors, error: hiredError } = await supabase.client
      .from("retailers_in_weddings")
      .select("*", { count: "exact", head: true })
      .eq("status", "HIRED")
      .is("deleted_at", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (hiredError) throw hiredError;
    const hiredVendorCount = hiredVendors || 0;

    const vendorConversionRate =
      totalVendorCount > 0
        ? Math.round((hiredVendorCount / totalVendorCount) * 10000) / 100
        : 0;

    // Calculate averages
    const avgTasksPerWedding =
      weddings > 0
        ? Math.round((totalTaskCount / weddings) * 100) / 100
        : 0;

    const avgVendorsPerWedding =
      weddings > 0
        ? Math.round((totalVendorCount / weddings) * 100) / 100
        : 0;

    // Count weddings with tasks
    const { data: weddingsWithTasksData } = await supabase.client
      .from("tasks")
      .select("wedding_id")
      .is("deleted_at", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    const weddingsWithTasks = new Set(
      (weddingsWithTasksData || []).map((t: { wedding_id: string }) => t.wedding_id)
    ).size;

    // Count weddings with vendors
    const { data: weddingsWithVendorsData } = await supabase.client
      .from("retailers_in_weddings")
      .select("wedding_id")
      .is("deleted_at", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    const weddingsWithVendors = new Set(
      (weddingsWithVendorsData || []).map((v: { wedding_id: string }) => v.wedding_id)
    ).size;

    // Vendor contact rate (contacted + hired / total)
    const vendorContactRate =
      totalVendorCount > 0
        ? Math.round(((contactedVendorCount + hiredVendorCount) / totalVendorCount) * 10000) / 100
        : 0;

    // Fully engaged: weddings with completed onboarding, tasks, and vendors
    const { data: completedOnboardingData } = await supabase.client
      .from("onboarding_sessions")
      .select("wedding_id")
      .not("completed_at", "is", null)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    const completedOnboardingWeddings = new Set(
      (completedOnboardingData || []).map((s: { wedding_id: string }) => s.wedding_id)
    );
    const weddingsWithTasksSet = new Set(
      (weddingsWithTasksData || []).map((t: { wedding_id: string }) => t.wedding_id)
    );
    const weddingsWithVendorsSet = new Set(
      (weddingsWithVendorsData || []).map((v: { wedding_id: string }) => v.wedding_id)
    );

    let fullyEngaged = 0;
    for (const weddingId of completedOnboardingWeddings) {
      if (weddingsWithTasksSet.has(weddingId) && weddingsWithVendorsSet.has(weddingId)) {
        fullyEngaged++;
      }
    }

    return {
      tasks: {
        totalTasks: totalTaskCount,
        completedTasks: completedTaskCount,
        taskCompletionRate,
      },
      vendors: {
        totalVendors: totalVendorCount,
        savedVendors: savedVendorCount,
        contactedVendors: contactedVendorCount,
        hiredVendors: hiredVendorCount,
        conversionRate: vendorConversionRate,
      },
      avgTasksPerWedding,
      avgVendorsPerWedding,
      weddingsWithTasks,
      weddingsWithVendors,
      vendorContactRate,
      fullyEngaged,
    };
  }

  async getTimeline(): Promise<WeddingTimelineResult> {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Upcoming 30 days
    const { count: upcoming30Days } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .gte("ceremony_date", today)
      .lte("ceremony_date", thirtyDaysLater)
      .eq("archived", false);

    // Past ceremony
    const { count: pastCeremony } = await supabase.client
      .from("weddings")
      .select("*", { count: "exact", head: true })
      .lt("ceremony_date", today)
      .not("ceremony_date", "is", null);

    // Same day events
    const { data: sameDayData } = await supabase.client
      .from("weddings")
      .select("id, ceremony_date, celebration_date")
      .not("ceremony_date", "is", null)
      .not("celebration_date", "is", null);

    const sameDayEvents = (sameDayData || []).filter(
      (w: { ceremony_date: string; celebration_date: string }) =>
        w.ceremony_date === w.celebration_date
    ).length;

    const multiDayEvents = (sameDayData || []).filter(
      (w: { ceremony_date: string; celebration_date: string }) =>
        w.ceremony_date !== w.celebration_date
    ).length;

    return {
      upcoming30Days: upcoming30Days || 0,
      pastCeremony: pastCeremony || 0,
      sameDayEvents,
      multiDayEvents,
    };
  }

  async getMissions(
    startDate: Date,
    endDate: Date
  ): Promise<WeddingMissionsResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Weddings with missions started
    const { data: missionsStartedData } = await supabase.client
      .from("missions")
      .select("wedding_id")
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    const weddingsStarted = new Set(
      (missionsStartedData || []).map((m: { wedding_id: string }) => m.wedding_id)
    ).size;

    // Weddings with missions completed
    const { data: missionsCompletedData } = await supabase.client
      .from("missions")
      .select("wedding_id")
      .eq("status", "COMPLETED")
      .gte("updated_at", startISO)
      .lte("updated_at", endISO);

    const weddingsCompleted = new Set(
      (missionsCompletedData || []).map((m: { wedding_id: string }) => m.wedding_id)
    ).size;

    // Ceremony venue booked
    const { data: ceremonyData } = await supabase.client
      .from("missions")
      .select("wedding_id")
      .eq("template_id", "CEREMONY_VENUE")
      .eq("status", "COMPLETED")
      .gte("updated_at", startISO)
      .lte("updated_at", endISO);

    const ceremonyVenueBooked = new Set(
      (ceremonyData || []).map((m: { wedding_id: string }) => m.wedding_id)
    ).size;

    // Celebration venue booked
    const { data: celebrationData } = await supabase.client
      .from("missions")
      .select("wedding_id")
      .eq("template_id", "CELEBRATION_VENUE")
      .eq("status", "COMPLETED")
      .gte("updated_at", startISO)
      .lte("updated_at", endISO);

    const celebrationVenueBooked = new Set(
      (celebrationData || []).map((m: { wedding_id: string }) => m.wedding_id)
    ).size;

    return {
      weddingsStarted,
      weddingsCompleted,
      ceremonyVenueBooked,
      celebrationVenueBooked,
    };
  }
}
