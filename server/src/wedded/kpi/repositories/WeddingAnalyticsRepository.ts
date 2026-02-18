/**
 * Wedding Analytics Repository
 *
 * Provides wedding overview and engagement metrics from PostgreSQL.
 */

import { query, queryCount } from "./queryHelper.js";
import {
  WeddingAnalyticsRepository,
  WeddingOverviewResult,
  WeddingEngagementResult,
  WeddingTimelineResult,
  WeddingMissionsResult,
} from "./types.js";

export class PgWeddingAnalyticsRepository
  implements WeddingAnalyticsRepository
{
  async getOverview(
    startDate: Date,
    endDate: Date
  ): Promise<WeddingOverviewResult> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Get total weddings in date range
    const total = await queryCount(
      'SELECT COUNT(*) FROM public.weddings WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    // Get active weddings (not archived) in date range
    const activeWeddings = await queryCount(
      'SELECT COUNT(*) FROM public.weddings WHERE archived = false AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );
    const archivedWeddings = total - activeWeddings;

    // Get weddings with partner
    const withPartner = await queryCount(
      'SELECT COUNT(*) FROM public.weddings WHERE wedder_2_id IS NOT NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );
    const soloPlanning = total - withPartner;

    // Get weddings with wedding date set
    const withCeremonyDateSet = await queryCount(
      'SELECT COUNT(*) FROM public.weddings WHERE wedding_date IS NOT NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );
    const withoutCeremonyDate = total - withCeremonyDateSet;

    // Get weddings with engagement date set
    const withCelebrationDateSet = await queryCount(
      'SELECT COUNT(*) FROM public.weddings WHERE engagement_date IS NOT NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );
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
    const weddings = await queryCount(
      'SELECT COUNT(*) FROM public.weddings WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    // Task metrics
    const totalTaskCount = await queryCount(
      'SELECT COUNT(*) FROM public.tasks WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const completedTaskCount = await queryCount(
      'SELECT COUNT(*) FROM public.tasks WHERE completed = true AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const taskCompletionRate =
      totalTaskCount > 0
        ? Math.round((completedTaskCount / totalTaskCount) * 10000) / 100
        : 0;

    // Vendor metrics
    const totalVendorCount = await queryCount(
      'SELECT COUNT(*) FROM public.retailers_in_weddings WHERE deleted_at IS NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const savedVendorCount = await queryCount(
      'SELECT COUNT(*) FROM public.retailers_in_weddings WHERE status = $1 AND deleted_at IS NULL AND created_at >= $2 AND created_at <= $3',
      ['SAVED', startISO, endISO]
    );

    const contactedVendorCount = await queryCount(
      'SELECT COUNT(*) FROM public.retailers_in_weddings WHERE status = $1 AND deleted_at IS NULL AND created_at >= $2 AND created_at <= $3',
      ['CONTACTED', startISO, endISO]
    );

    const hiredVendorCount = await queryCount(
      'SELECT COUNT(*) FROM public.retailers_in_weddings WHERE status = $1 AND deleted_at IS NULL AND created_at >= $2 AND created_at <= $3',
      ['HIRED', startISO, endISO]
    );

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
    const weddingsWithTasksData = await query<{ wedding_id: string }>(
      'SELECT wedding_id FROM public.tasks WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const weddingsWithTasks = new Set(
      weddingsWithTasksData.map((t) => t.wedding_id)
    ).size;

    // Count weddings with vendors
    const weddingsWithVendorsData = await query<{ wedding_id: string }>(
      'SELECT wedding_id FROM public.retailers_in_weddings WHERE deleted_at IS NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const weddingsWithVendors = new Set(
      weddingsWithVendorsData.map((v) => v.wedding_id)
    ).size;

    // Vendor contact rate (contacted + hired / total)
    const vendorContactRate =
      totalVendorCount > 0
        ? Math.round(((contactedVendorCount + hiredVendorCount) / totalVendorCount) * 10000) / 100
        : 0;

    // Fully engaged: weddings with completed onboarding, tasks, and vendors
    const completedOnboardingData = await query<{ wedding_id: string }>(
      'SELECT wedding_id FROM public.onboarding_sessions WHERE completed_at IS NOT NULL AND created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const completedOnboardingWeddings = new Set(
      completedOnboardingData.map((s) => s.wedding_id)
    );
    const weddingsWithTasksSet = new Set(
      weddingsWithTasksData.map((t) => t.wedding_id)
    );
    const weddingsWithVendorsSet = new Set(
      weddingsWithVendorsData.map((v) => v.wedding_id)
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
    const upcoming30Days = await queryCount(
      'SELECT COUNT(*) FROM public.weddings WHERE wedding_date >= $1 AND wedding_date <= $2 AND archived = false',
      [today, thirtyDaysLater]
    );

    // Past wedding
    const pastCeremony = await queryCount(
      'SELECT COUNT(*) FROM public.weddings WHERE wedding_date < $1 AND wedding_date IS NOT NULL',
      [today]
    );

    // Same day events (wedding_date vs engagement_date)
    const sameDayData = await query<{ id: string; wedding_date: string; engagement_date: string }>(
      'SELECT id, wedding_date, engagement_date FROM public.weddings WHERE wedding_date IS NOT NULL AND engagement_date IS NOT NULL',
      []
    );

    const sameDayEvents = sameDayData.filter(
      (w) => w.wedding_date === w.engagement_date
    ).length;

    const multiDayEvents = sameDayData.filter(
      (w) => w.wedding_date !== w.engagement_date
    ).length;

    return {
      upcoming30Days,
      pastCeremony,
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
    const missionsStartedData = await query<{ wedding_id: string }>(
      'SELECT wedding_id FROM public.missions WHERE created_at >= $1 AND created_at <= $2',
      [startISO, endISO]
    );

    const weddingsStarted = new Set(
      missionsStartedData.map((m) => m.wedding_id)
    ).size;

    // Weddings with missions completed
    const missionsCompletedData = await query<{ wedding_id: string }>(
      'SELECT wedding_id FROM public.missions WHERE status = $1 AND updated_at >= $2 AND updated_at <= $3',
      ['COMPLETED', startISO, endISO]
    );

    const weddingsCompleted = new Set(
      missionsCompletedData.map((m) => m.wedding_id)
    ).size;

    // Ceremony venue booked
    const ceremonyData = await query<{ wedding_id: string }>(
      'SELECT wedding_id FROM public.missions WHERE template_id = $1 AND status = $2 AND updated_at >= $3 AND updated_at <= $4',
      ['CEREMONY_VENUE', 'COMPLETED', startISO, endISO]
    );

    const ceremonyVenueBooked = new Set(
      ceremonyData.map((m) => m.wedding_id)
    ).size;

    // Celebration venue booked
    const celebrationData = await query<{ wedding_id: string }>(
      'SELECT wedding_id FROM public.missions WHERE template_id = $1 AND status = $2 AND updated_at >= $3 AND updated_at <= $4',
      ['CELEBRATION_VENUE', 'COMPLETED', startISO, endISO]
    );

    const celebrationVenueBooked = new Set(
      celebrationData.map((m) => m.wedding_id)
    ).size;

    return {
      weddingsStarted,
      weddingsCompleted,
      ceremonyVenueBooked,
      celebrationVenueBooked,
    };
  }
}
