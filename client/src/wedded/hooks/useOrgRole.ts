/**
 * useOrgRole Hook
 *
 * Provides organization role information for the current user.
 * Used to control visibility of sections based on role (e.g., investors).
 */

import { authClient } from "../../lib/auth";
import { useUserOrganizations } from "../../api/admin/hooks/useOrganizations";

export type OrgRole = "owner" | "admin" | "member" | "investor";

export interface UseOrgRoleResult {
  role: OrgRole | null;
  isInvestor: boolean;
  canAccessWebAnalytics: boolean;
  canAccessKPIs: boolean;
  canAccessSettings: boolean;
  isLoading: boolean;
}

/**
 * Hook to get the user's role in the current organization
 *
 * Access Matrix:
 * | Section       | investor | member | admin | owner |
 * |---------------|----------|--------|-------|-------|
 * | Web Analytics | No       | Yes    | Yes   | Yes   |
 * | Business KPIs | Yes      | Yes    | Yes   | Yes   |
 * | Settings      | No       | No     | Yes   | Yes   |
 */
export function useOrgRole(): UseOrgRoleResult {
  const { data: activeOrganization, isPending: isOrgPending } = authClient.useActiveOrganization();
  const { data: organizations, isLoading: isOrgsLoading } = useUserOrganizations();

  const isLoading = isOrgPending || isOrgsLoading;

  // Find the current organization's role
  const currentOrg = organizations?.find((org) => org.id === activeOrganization?.id);
  const role = (currentOrg?.role as OrgRole) || null;

  // Determine access based on role
  const isInvestor = role === "investor";
  const canAccessWebAnalytics = !isInvestor && role !== null;
  const canAccessKPIs = role !== null; // All roles can access KPIs
  const canAccessSettings = role === "admin" || role === "owner";

  return {
    role,
    isInvestor,
    canAccessWebAnalytics,
    canAccessKPIs,
    canAccessSettings,
    isLoading,
  };
}

/**
 * Hook to check if user should be redirected from a section
 */
export function useOrgRoleRedirect() {
  const { isInvestor, isLoading } = useOrgRole();

  return {
    shouldRedirectFromAnalytics: isInvestor && !isLoading,
    redirectTo: "/kpi",
    isLoading,
  };
}
