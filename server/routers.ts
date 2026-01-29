import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { stripeRouter } from "./stripeRouter";
import { codeGenerationRouter } from "./codeGenerationRouter";
import { collaborationRouter } from "./collaborationRouter";
import { projectsRouter } from "./projectsRouter";
import { advancedCodeGenRouter } from "./advancedCodeGenRouter";
import { exportRouter } from "./exportRouter";
import { multiInterfaceRouter } from "./multiInterfaceRouter";
import { multiInterfaceExportRouter } from "./multiInterfaceExportRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { ONE_YEAR_MS } from "@shared/const";
import { sdk } from "./_core/sdk";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { loginUser } = await import("./auth");
        const result = await loginUser(input);
        if (result.success && result.user) {
          const sessionToken = await sdk.createSessionToken(result.user.openId, {
            name: result.user.name || "",
            expiresInMs: ONE_YEAR_MS,
          });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          return { success: true, user: result.user };
        }
        throw new Error(result.error || "Login failed");
      }),
    register: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string(), name: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { registerUser } = await import("./auth");
        const result = await registerUser(input);
        if (result.success && result.userId) {
          const { loginUser } = await import("./auth");
          const loginResult = await loginUser({ email: input.email, password: input.password });
          if (loginResult.success && loginResult.user) {
            const sessionToken = await sdk.createSessionToken(loginResult.user.openId, {
              name: loginResult.user.name || "",
              expiresInMs: ONE_YEAR_MS,
            });
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
            return { success: true, user: loginResult.user };
          }
        }
        throw new Error(result.error || "Registration failed");
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: projectsRouter,
  subscription: router({
    current: protectedProcedure.query(async ({ ctx }: any) => {
      const { getUserSubscription } = await import("./db");
      return getUserSubscription(ctx.user.id);
    }),
  }),
  stripe: stripeRouter,
  codeGeneration: codeGenerationRouter,
  advancedCodeGen: advancedCodeGenRouter,
  collaboration: collaborationRouter,
  export: exportRouter,
  multiInterface: multiInterfaceRouter,
  multiInterfaceExport: multiInterfaceExportRouter,
});

export type AppRouter = typeof appRouter;
