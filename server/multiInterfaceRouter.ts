import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  projectInterfaces,
  interfaceLinks,
  projects,
  type ProjectInterface,
  type InterfaceLink,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const multiInterfaceRouter = router({
  // Create a new interface for a project
  createInterface: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().min(1, "Interface name is required"),
        type: z.enum(["frontend", "backend", "mobile", "api", "database"]),
        language: z.enum(["react", "vue", "angular", "svelte", "html", "nodejs", "python", "php", "java", "csharp"]),
        framework: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify user owns the project
        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        const project = projectList[0];
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const result = await db.insert(projectInterfaces).values({
          projectId: input.projectId,
          name: input.name,
          type: input.type,
          language: input.language,
          framework: input.framework || null,
          description: input.description || null,
          generatedCode: null,
          dependencies: JSON.stringify([]),
          version: "1.0.0",
          status: "draft",
        });

        return {
          success: true,
          interfaceId: (result as any)[0].insertId,
          message: "Interface created successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to create interface",
        };
      }
    }),

  // Get all interfaces for a project
  getProjectInterfaces: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify user has access to project
        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        const project = projectList[0];
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const interfaces = await db
          .select()
          .from(projectInterfaces)
          .where(eq(projectInterfaces.projectId, input.projectId));

        return {
          success: true,
          interfaces: interfaces || ([] as any[]),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch interfaces",
          interfaces: [] as any[],
        };
      }
    }),

  // Update interface code and metadata
  updateInterface: protectedProcedure
    .input(
      z.object({
        interfaceId: z.number(),
        generatedCode: z.string().optional(),
        dependencies: z.array(z.string()).optional(),
        status: z.enum(["draft", "active", "archived"]).optional(),
        version: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify user has access
        const ifaceList = await db
          .select()
          .from(projectInterfaces)
          .where(eq(projectInterfaces.id, input.interfaceId))
          .limit(1);

        const iface = ifaceList[0];
        if (!iface) {
          throw new Error("Interface not found");
        }

        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, iface.projectId))
          .limit(1);

        const project = projectList[0];
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        await db
          .update(projectInterfaces)
          .set({
            generatedCode: input.generatedCode || iface.generatedCode,
            dependencies: input.dependencies ? JSON.stringify(input.dependencies) : iface.dependencies,
            status: input.status || iface.status,
            version: input.version || iface.version,
            updatedAt: new Date(),
          })
          .where(eq(projectInterfaces.id, input.interfaceId));

        return { success: true, message: "Interface updated successfully" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to update interface",
        };
      }
    }),

  // Delete interface
  deleteInterface: protectedProcedure
    .input(z.object({ interfaceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const ifaceList = await db
          .select()
          .from(projectInterfaces)
          .where(eq(projectInterfaces.id, input.interfaceId))
          .limit(1);

        const iface = ifaceList[0];
        if (!iface) {
          throw new Error("Interface not found");
        }

        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, iface.projectId))
          .limit(1);

        const project = projectList[0];
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Delete all links associated with this interface
        await db
          .delete(interfaceLinks)
          .where(eq(interfaceLinks.sourceInterfaceId, input.interfaceId));
        await db
          .delete(interfaceLinks)
          .where(eq(interfaceLinks.targetInterfaceId, input.interfaceId));

        // Delete the interface
        await db.delete(projectInterfaces).where(eq(projectInterfaces.id, input.interfaceId));

        return { success: true, message: "Interface deleted successfully" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to delete interface",
        };
      }
    }),

  // Link two interfaces together
  linkInterfaces: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        sourceInterfaceId: z.number(),
        targetInterfaceId: z.number(),
        linkType: z.enum(["calls", "depends_on", "extends", "implements", "communicates_with"]),
        description: z.string().optional(),
        apiEndpoint: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify user owns the project
        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        const project = projectList[0];
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Check for circular dependencies
        if (input.sourceInterfaceId === input.targetInterfaceId) {
          throw new Error("Cannot link an interface to itself");
        }

        // Create the link
        const result = await db.insert(interfaceLinks).values({
          projectId: input.projectId,
          sourceInterfaceId: input.sourceInterfaceId,
          targetInterfaceId: input.targetInterfaceId,
          linkType: input.linkType,
          description: input.description || null,
          apiEndpoint: input.apiEndpoint || null,
        });

        return {
          success: true,
          linkId: (result as any)[0].insertId,
          message: "Interfaces linked successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to link interfaces",
        };
      }
    }),

  // Get all links for a project
  getInterfaceLinks: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify user has access
        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        const project = projectList[0];
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const links = await db
          .select()
          .from(interfaceLinks)
          .where(eq(interfaceLinks.projectId, input.projectId));

        return {
          success: true,
          links: links || ([] as any[]),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch links",
          links: [] as any[],
        };
      }
    }),

  // Remove a link between interfaces
  removeLink: protectedProcedure
    .input(z.object({ linkId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const linkList = await db
          .select()
          .from(interfaceLinks)
          .where(eq(interfaceLinks.id, input.linkId))
          .limit(1);

        const link = linkList[0];
        if (!link) {
          throw new Error("Link not found");
        }

        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, link.projectId))
          .limit(1);

        const project = projectList[0];
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        await db.delete(interfaceLinks).where(eq(interfaceLinks.id, input.linkId));

        return { success: true, message: "Link removed successfully" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to remove link",
        };
      }
    }),

  // Get interface types and categories
  getInterfaceTypes: protectedProcedure.query(() => {
    return [
      {
        id: "frontend",
        name: "Frontend",
        description: "User interface and client-side application",
        icon: "🎨",
      },
      {
        id: "backend",
        name: "Backend",
        description: "Server-side API and business logic",
        icon: "⚙️",
      },
      {
        id: "mobile",
        name: "Mobile",
        description: "Mobile application (iOS/Android)",
        icon: "📱",
      },
      {
        id: "api",
        name: "API",
        description: "REST or GraphQL API service",
        icon: "🔌",
      },
      {
        id: "database",
        name: "Database",
        description: "Database schema and models",
        icon: "🗄️",
      },
    ];
  }),

  // Get link types
  getLinkTypes: protectedProcedure.query(() => {
    return [
      {
        id: "calls",
        name: "Calls",
        description: "One interface calls another",
      },
      {
        id: "depends_on",
        name: "Depends On",
        description: "One interface depends on another",
      },
      {
        id: "extends",
        name: "Extends",
        description: "One interface extends another",
      },
      {
        id: "implements",
        name: "Implements",
        description: "One interface implements another",
      },
      {
        id: "communicates_with",
        name: "Communicates With",
        description: "Bidirectional communication",
      },
    ];
  }),

  // Get dependency graph for a project
  getDependencyGraph: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        const project = projectList[0];
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const interfaces = await db
          .select()
          .from(projectInterfaces)
          .where(eq(projectInterfaces.projectId, input.projectId));

        const links = await db
          .select()
          .from(interfaceLinks)
          .where(eq(interfaceLinks.projectId, input.projectId));

        return {
          success: true,
          nodes: (interfaces || []).map((iface: any) => ({
            id: iface.id,
            label: iface.name,
            type: iface.type,
            language: iface.language,
            status: iface.status,
          })),
          edges: (links || []).map((link: any) => ({
            id: link.id,
            source: link.sourceInterfaceId,
            target: link.targetInterfaceId,
            label: link.linkType,
            type: link.linkType,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch dependency graph",
          nodes: [] as any[],
          edges: [] as any[],
        };
      }
    }),
});
