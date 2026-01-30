import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { BACKEND_URL, IS_CLOUD } from "../const";
import { authedFetch } from "../../api/utils";

export interface SubscriptionData {
  id: string;
  planName: string;
  status: "expired" | "active" | "trialing" | "free";
  currentPeriodEnd: string;
  currentPeriodStart: string;
  createdAt: string;
  monthlyEventCount: number;
  eventLimit: number;
  interval: string;
  cancelAtPeriodEnd: boolean;
  isTrial?: boolean;
  trialDaysRemaining?: number;
  message?: string; // For expired trial message
  isPro?: boolean;
  isOverride?: boolean;
}

export function useStripeSubscription(): UseQueryResult<SubscriptionData, Error> {
  const { data: activeOrg } = authClient.useActiveOrganization();

  const fetchSubscription = async (): Promise<SubscriptionData> => {
    // Return a default "free" subscription for self-hosted/local instances
    if (!activeOrg || !IS_CLOUD) {
      return {
        id: "self-hosted",
        planName: "Self-Hosted",
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        currentPeriodStart: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        monthlyEventCount: 0,
        eventLimit: Infinity,
        interval: "lifetime",
        cancelAtPeriodEnd: false,
        isPro: true,
        isOverride: false,
      };
    }

    return authedFetch<SubscriptionData>(`/stripe/subscription?organizationId=${activeOrg.id}`);
  };

  return useQuery<SubscriptionData>({
    queryKey: ["stripe-subscription", activeOrg?.id],
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!activeOrg,
  });
}
