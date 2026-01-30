/**
 * Investor Access Middleware
 *
 * Provides role-based access control for the KPI section.
 *
 * Access Matrix:
 * | Section       | investor | member | admin | owner |
 * |---------------|----------|--------|-------|-------|
 * | Web Analytics | No       | Yes    | Yes   | Yes   |
 * | Business KPIs | Yes      | Yes    | Yes   | Yes   |
 * | Settings      | No       | No     | Yes   | Yes   |
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { getSessionFromReq, getUserIsInOrg } from "../../lib/auth-utils.js";
import { db } from "../../db/postgres/postgres.js";

type AuthMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<void>;

/**
 * Requires access to KPI section.
 * All organization members (including investors) can access KPIs.
 */
export const requireKPIAccess: AuthMiddleware = async (request, reply) => {
  const params = request.params as Record<string, string>;
  const organizationId = params.organizationId;

  if (!organizationId) {
    return reply.status(400).send({ error: "Organization ID required" });
  }

  const session = await getSessionFromReq(request);
  if (!session?.user?.id) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  // Check if user is member of org (any role, including investor)
  const isMember = await getUserIsInOrg(request, organizationId);
  if (!isMember) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  request.user = session.user;
};

/**
 * Requires access to web analytics section.
 * Excludes investors - only member, admin, and owner roles.
 */
export const requireAnalyticsAccess: AuthMiddleware = async (request, reply) => {
  const params = request.params as Record<string, string>;
  const organizationId = params.organizationId;

  if (!organizationId) {
    return reply.status(400).send({ error: "Organization ID required" });
  }

  const session = await getSessionFromReq(request);
  if (!session?.user?.id) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  // Check org membership with role check
  const member = await db.query.member.findFirst({
    where: (member, { and, eq }) =>
      and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, organizationId)
      ),
  });

  if (!member) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  // Investors cannot access web analytics
  if (member.role === "investor") {
    return reply.status(403).send({
      error: "Investors do not have access to web analytics",
      code: "INVESTOR_RESTRICTED",
    });
  }

  request.user = session.user;
};

/**
 * Gets the user's role in an organization.
 * Returns null if user is not a member.
 */
export async function getUserOrgRole(
  userId: string,
  organizationId: string
): Promise<string | null> {
  const member = await db.query.member.findFirst({
    where: (member, { and, eq }) =>
      and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
  });

  return member?.role || null;
}

/**
 * Checks if a user is an investor in an organization.
 */
export async function isUserInvestor(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const role = await getUserOrgRole(userId, organizationId);
  return role === "investor";
}
