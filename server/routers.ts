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

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
