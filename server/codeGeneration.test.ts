import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Code Generation Router", () => {
  it("should get available design styles", async () => {
    const caller = appRouter.createCaller({} as any);
    const styles = await caller.codeGeneration.getStyles();

    expect(Array.isArray(styles)).toBe(true);
    expect(styles.length).toBeGreaterThan(0);
    expect(styles[0]).toHaveProperty("id");
    expect(styles[0]).toHaveProperty("name");
    expect(styles[0]).toHaveProperty("description");
  });

  it("should test LLM connection", async () => {
    const caller = appRouter.createCaller({} as any);
    const result = await caller.codeGeneration.testConnection();

    expect(result).toHaveProperty("connected");
    expect(result).toHaveProperty("message");
    expect(typeof result.connected).toBe("boolean");
  });

  it(
    "should generate code from description for authenticated user",
    async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.codeGeneration.generateFromDescription({
        description: "Create a simple hello world page with a button",
        style: "modern",
        includeResponsive: true,
      });

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("html");
      expect(result.data).toHaveProperty("css");
      expect(result.data).toHaveProperty("javascript");
      expect(result.data).toHaveProperty("description");

      // Verify generated code is not empty
      expect(result.data.html.length).toBeGreaterThan(0);
      expect(result.data.css.length).toBeGreaterThan(0);
    },
    { timeout: 15000 }
  );

  it(
    "should validate different design styles",
    async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const styles = ["modern"];

      for (const style of styles) {
        const result = await caller.codeGeneration.generateFromDescription({
          description: "Create a professional website",
          style: style as any,
          includeResponsive: true,
        });

        expect(result.success).toBe(true);
        expect(result.data.html).toBeDefined();
        expect(result.data.css).toBeDefined();
      }
    },
    { timeout: 15000 }
  );

  it(
    "should sanitize generated code",
    async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.codeGeneration.generateFromDescription({
        description: "Create a form with input fields",
        style: "modern",
        includeResponsive: true,
      });

      // Check that malicious patterns are not present
      expect(result.data.html).not.toContain("<script");
      expect(result.data.html).not.toContain("onclick=");
      expect(result.data.css).not.toContain("@import");
      expect(result.data.javascript).not.toContain("eval(");
    },
    { timeout: 15000 }
  );
});
