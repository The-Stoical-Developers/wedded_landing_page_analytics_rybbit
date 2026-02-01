/**
 * Investor Access Middleware Unit Tests
 *
 * Tests role-based access control for the KPI section.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";

// Mock dependencies
const mockGetSessionFromReq = vi.fn();
const mockGetUserIsInOrg = vi.fn();
const mockDbQueryMemberFindFirst = vi.fn();

vi.mock("../../lib/auth-utils.js", () => ({
  getSessionFromReq: (...args: any[]) => mockGetSessionFromReq(...args),
  getUserIsInOrg: (...args: any[]) => mockGetUserIsInOrg(...args),
}));

vi.mock("../../db/postgres/postgres.js", () => ({
  db: {
    query: {
      member: {
        findFirst: (...args: any[]) => mockDbQueryMemberFindFirst(...args),
      },
    },
  },
}));

describe("Investor Access Middleware", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let statusMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    sendMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ send: sendMock });

    mockRequest = {
      params: { organizationId: "org-123" },
      user: undefined,
    };

    mockReply = {
      status: statusMock,
      send: sendMock,
    };
  });

  describe("requireKPIAccess", () => {
    it("should return 400 when organizationId is missing", async () => {
      mockRequest.params = {};

      const { requireKPIAccess } = await import("./investorAccess.js");

      await requireKPIAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith({ error: "Organization ID required" });
    });

    it("should return 401 when user is not authenticated", async () => {
      mockGetSessionFromReq.mockResolvedValue(null);

      const { requireKPIAccess } = await import("./investorAccess.js");

      await requireKPIAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 401 when session has no user id", async () => {
      mockGetSessionFromReq.mockResolvedValue({ user: { id: null } });

      const { requireKPIAccess } = await import("./investorAccess.js");

      await requireKPIAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 403 when user is not member of org", async () => {
      mockGetSessionFromReq.mockResolvedValue({ user: { id: "user-123" } });
      mockGetUserIsInOrg.mockResolvedValue(false);

      const { requireKPIAccess } = await import("./investorAccess.js");

      await requireKPIAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(sendMock).toHaveBeenCalledWith({ error: "Forbidden" });
    });

    it("should set request.user and allow access when user is org member", async () => {
      const user = { id: "user-123", email: "test@example.com" };
      mockGetSessionFromReq.mockResolvedValue({ user });
      mockGetUserIsInOrg.mockResolvedValue(true);

      const { requireKPIAccess } = await import("./investorAccess.js");

      await requireKPIAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockRequest.user).toEqual(user);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should allow investors to access KPIs", async () => {
      const user = { id: "investor-123" };
      mockGetSessionFromReq.mockResolvedValue({ user });
      mockGetUserIsInOrg.mockResolvedValue(true); // Investor is still a member

      const { requireKPIAccess } = await import("./investorAccess.js");

      await requireKPIAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockRequest.user).toEqual(user);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("requireAnalyticsAccess", () => {
    it("should return 400 when organizationId is missing", async () => {
      mockRequest.params = {};

      const { requireAnalyticsAccess } = await import("./investorAccess.js");

      await requireAnalyticsAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith({ error: "Organization ID required" });
    });

    it("should return 401 when user is not authenticated", async () => {
      mockGetSessionFromReq.mockResolvedValue(null);

      const { requireAnalyticsAccess } = await import("./investorAccess.js");

      await requireAnalyticsAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("should return 403 when user is not member of org", async () => {
      mockGetSessionFromReq.mockResolvedValue({ user: { id: "user-123" } });
      mockDbQueryMemberFindFirst.mockResolvedValue(null);

      const { requireAnalyticsAccess } = await import("./investorAccess.js");

      await requireAnalyticsAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(sendMock).toHaveBeenCalledWith({ error: "Forbidden" });
    });

    it("should return 403 with INVESTOR_RESTRICTED when user is investor", async () => {
      mockGetSessionFromReq.mockResolvedValue({ user: { id: "investor-123" } });
      mockDbQueryMemberFindFirst.mockResolvedValue({ role: "investor" });

      const { requireAnalyticsAccess } = await import("./investorAccess.js");

      await requireAnalyticsAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(sendMock).toHaveBeenCalledWith({
        error: "Investors do not have access to web analytics",
        code: "INVESTOR_RESTRICTED",
      });
    });

    it("should allow access for member role", async () => {
      const user = { id: "member-123" };
      mockGetSessionFromReq.mockResolvedValue({ user });
      mockDbQueryMemberFindFirst.mockResolvedValue({ role: "member" });

      const { requireAnalyticsAccess } = await import("./investorAccess.js");

      await requireAnalyticsAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockRequest.user).toEqual(user);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should allow access for admin role", async () => {
      const user = { id: "admin-123" };
      mockGetSessionFromReq.mockResolvedValue({ user });
      mockDbQueryMemberFindFirst.mockResolvedValue({ role: "admin" });

      const { requireAnalyticsAccess } = await import("./investorAccess.js");

      await requireAnalyticsAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockRequest.user).toEqual(user);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should allow access for owner role", async () => {
      const user = { id: "owner-123" };
      mockGetSessionFromReq.mockResolvedValue({ user });
      mockDbQueryMemberFindFirst.mockResolvedValue({ role: "owner" });

      const { requireAnalyticsAccess } = await import("./investorAccess.js");

      await requireAnalyticsAccess(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockRequest.user).toEqual(user);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("getUserOrgRole", () => {
    it("should return user role when found", async () => {
      mockDbQueryMemberFindFirst.mockResolvedValue({ role: "admin" });

      const { getUserOrgRole } = await import("./investorAccess.js");

      const result = await getUserOrgRole("user-123", "org-123");

      expect(result).toBe("admin");
    });

    it("should return null when user is not member", async () => {
      mockDbQueryMemberFindFirst.mockResolvedValue(null);

      const { getUserOrgRole } = await import("./investorAccess.js");

      const result = await getUserOrgRole("user-123", "org-123");

      expect(result).toBeNull();
    });
  });

  describe("isUserInvestor", () => {
    it("should return true when user is investor", async () => {
      mockDbQueryMemberFindFirst.mockResolvedValue({ role: "investor" });

      const { isUserInvestor } = await import("./investorAccess.js");

      const result = await isUserInvestor("user-123", "org-123");

      expect(result).toBe(true);
    });

    it("should return false when user is not investor", async () => {
      mockDbQueryMemberFindFirst.mockResolvedValue({ role: "member" });

      const { isUserInvestor } = await import("./investorAccess.js");

      const result = await isUserInvestor("user-123", "org-123");

      expect(result).toBe(false);
    });

    it("should return false when user is not member", async () => {
      mockDbQueryMemberFindFirst.mockResolvedValue(null);

      const { isUserInvestor } = await import("./investorAccess.js");

      const result = await isUserInvestor("user-123", "org-123");

      expect(result).toBe(false);
    });
  });
});
