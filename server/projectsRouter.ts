import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { projects } from "../drizzle/schema";
import { eq, and, like, desc, asc } from "drizzle-orm";

export const projectsRouter = router({
  // Save a new project or update existing
  save: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        title: z.string().min(1, "Project name is required"),
        description: z.string(),
        generatedHtml: z.string(),
        generatedCss: z.string(),
        generatedJs: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();

      if (input.id) {
        // Update existing project
        await db
          .update(projects)
          .set({
            title: input.title,
            description: input.description,
            generatedHtml: input.generatedHtml,
            generatedCss: input.generatedCss,
            generatedJs: input.generatedJs,
            updatedAt: now,
          })
          .where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)));

        return { success: true, id: input.id };
      } else {
        // Create new project
        const result = await db.insert(projects).values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          generatedHtml: input.generatedHtml,
          generatedCss: input.generatedCss,
          generatedJs: input.generatedJs,
          createdAt: now,
          updatedAt: now,
        });

        return { success: true, id: result[0]?.insertId?.toString() || "" };
      }
    }),

  // Get a single project
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)))
        .limit(1);

      return result[0] || null;
    }),

  // List all projects for current user
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        sortBy: z.enum(["title", "date"]).optional().default("date"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const baseQuery = db
        .select()
        .from(projects)
        .where(eq(projects.userId, ctx.user.id));

      // Apply search filter
      let filteredQuery = baseQuery;
      if (input.search) {
        filteredQuery = db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.userId, ctx.user.id),
              like(projects.title, `%${input.search}%`)
            )
          );
      }

      // Apply sorting
      let sortedQuery;
      if (input.sortBy === "title") {
        sortedQuery =
          input.sortOrder === "desc"
            ? filteredQuery.orderBy(desc(projects.title))
            : filteredQuery.orderBy(asc(projects.title));
      } else {
        sortedQuery =
          input.sortOrder === "desc"
            ? filteredQuery.orderBy(desc(projects.updatedAt))
            : filteredQuery.orderBy(asc(projects.updatedAt));
      }

      // Apply pagination
      const result = await sortedQuery.limit(input.limit).offset(input.offset);
      return result;
    }),

  // Delete a project
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(projects)
        .where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)));

      return { success: true };
    }),

  // Get project count for current user
  count: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, ctx.user.id));

    return result.length;
  }),

  // Duplicate a project
  duplicate: protectedProcedure
    .input(z.object({ id: z.number(), newTitle: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get original project
      const original = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)))
        .limit(1);

      if (!original[0]) throw new Error("Project not found");

      const now = new Date();

      // Create duplicate
      const result = await db.insert(projects).values({
        userId: ctx.user.id,
        title: input.newTitle,
        description: original[0].description,
        generatedHtml: original[0].generatedHtml,
        generatedCss: original[0].generatedCss,
        generatedJs: original[0].generatedJs,
        createdAt: now,
        updatedAt: now,
      });

      return { success: true, id: result[0]?.insertId?.toString() || "" };
    }),
});
