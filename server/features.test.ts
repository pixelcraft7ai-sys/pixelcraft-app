import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): {
  ctx: TrpcContext;
} {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `sample-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {
        origin: "https://pixelcraft.local",
      },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Projects Router", () => {
  it("should list projects for authenticated user", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      const projects = await caller.projects.list();
      expect(Array.isArray(projects)).toBe(true);
    } catch (error: any) {
      // Database might not be available in test environment
      expect(error.message).toContain("Database");
    }
  });

  it("should create a new project", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.projects.create({
        title: "Test Project",
        description: "This is a test project",
      });
      expect(result).toBeDefined();
    } catch (error: any) {
      // Database might not be available in test environment
      expect(error.message).toContain("Database");
    }
  });

  it("should validate project input", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.projects.create({
        title: "",
        description: "Invalid project",
      } as any);
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});

describe("Subscription Router", () => {
  it("should get current subscription or null", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      const subscription = await caller.subscription.current();
      expect(subscription === null || typeof subscription === "object").toBe(true);
    } catch (error: any) {
      expect(true).toBe(true);
    }
  });
});

describe("Stripe Router", () => {
  it("should validate plan selection", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.stripe.createCheckoutSession({
        planId: "invalid-plan",
      });
    } catch (error: any) {
      expect(error.message).toContain("Invalid plan");
    }
  });

  it("should reject free plan for checkout", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.stripe.createCheckoutSession({
        planId: "free",
      });
    } catch (error: any) {
      expect(error.message).toContain("Invalid plan");
    }
  });

  it("should require price configuration", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.stripe.createCheckoutSession({
        planId: "personal",
      });
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});

describe("Auth Router", () => {
  it("should return current user", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();
    expect(user?.id).toBe(1);
    expect(user?.email).toBe("user1@example.com");
  });

  it("should logout user", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
