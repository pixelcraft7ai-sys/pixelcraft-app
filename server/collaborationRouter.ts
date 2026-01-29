import { protectedProcedure, router } from "./_core/trpc";
import {
  addCollaborator,
  acceptCollaborationInvite,
  getProjectCollaborators,
  removeCollaborator,
  hasProjectAccess,
  logActivity,
  getActivityLogs,
  createActiveSession,
  getActiveSessions,
  removeActiveSession,
  updateSessionActivity,
} from "./collaboration";
import { nanoid } from "nanoid";

export const collaborationRouter = router({
  /**
   * Invite a user to collaborate on a project
   */
  inviteCollaborator: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.projectId !== "number") throw new Error("projectId must be number");
      if (typeof obj.userId !== "number") throw new Error("userId must be number");
      if (typeof obj.role !== "string") throw new Error("role must be string");
      return {
        projectId: obj.projectId,
        userId: obj.userId,
        role: obj.role as "owner" | "editor" | "viewer",
      };
    })
    .mutation(async ({ input }: any) => {
      try {
        await addCollaborator(input.projectId, input.userId, input.role);
        return { success: true, message: "Collaborator invited" };
      } catch (error: any) {
        throw new Error(`Failed to invite collaborator: ${error.message}`);
      }
    }),

  /**
   * Accept collaboration invitation
   */
  acceptInvite: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.projectId !== "number") throw new Error("projectId must be number");
      return { projectId: obj.projectId };
    })
    .mutation(async ({ ctx, input }: any) => {
      try {
        await acceptCollaborationInvite(input.projectId, ctx.user.id);
        return { success: true, message: "Invitation accepted" };
      } catch (error: any) {
        throw new Error(`Failed to accept invitation: ${error.message}`);
      }
    }),

  /**
   * Get all collaborators for a project
   */
  getCollaborators: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.projectId !== "number") throw new Error("projectId must be number");
      return { projectId: obj.projectId };
    })
    .query(async ({ input }: any) => {
      try {
        return await getProjectCollaborators(input.projectId);
      } catch (error: any) {
        throw new Error(`Failed to get collaborators: ${error.message}`);
      }
    }),

  /**
   * Remove a collaborator from a project
   */
  removeCollaborator: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.projectId !== "number") throw new Error("projectId must be number");
      if (typeof obj.userId !== "number") throw new Error("userId must be number");
      return { projectId: obj.projectId, userId: obj.userId };
    })
    .mutation(async ({ input }: any) => {
      try {
        await removeCollaborator(input.projectId, input.userId);
        return { success: true, message: "Collaborator removed" };
      } catch (error: any) {
        throw new Error(`Failed to remove collaborator: ${error.message}`);
      }
    }),

  /**
   * Get activity logs for a project
   */
  getActivityLogs: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.projectId !== "number") throw new Error("projectId must be number");
      return { projectId: obj.projectId, limit: (obj.limit as number) || 50 };
    })
    .query(async ({ input }: any) => {
      try {
        return await getActivityLogs(input.projectId, input.limit);
      } catch (error: any) {
        throw new Error(`Failed to get activity logs: ${error.message}`);
      }
    }),

  /**
   * Log an activity
   */
  logActivity: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.projectId !== "number") throw new Error("projectId must be number");
      if (typeof obj.action !== "string") throw new Error("action must be string");
      return {
        projectId: obj.projectId,
        action: obj.action,
        fieldChanged: (obj.fieldChanged as string) || undefined,
        oldValue: (obj.oldValue as string) || undefined,
        newValue: (obj.newValue as string) || undefined,
      };
    })
    .mutation(async ({ ctx, input }: any) => {
      try {
        await logActivity(
          input.projectId,
          ctx.user.id,
          input.action,
          input.fieldChanged,
          input.oldValue,
          input.newValue
        );
        return { success: true };
      } catch (error: any) {
        throw new Error(`Failed to log activity: ${error.message}`);
      }
    }),

  /**
   * Create an active session for real-time collaboration
   */
  createSession: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.projectId !== "number") throw new Error("projectId must be number");
      return { projectId: obj.projectId };
    })
    .mutation(async ({ ctx, input }: any) => {
      try {
        const sessionId = nanoid();
        await createActiveSession(input.projectId, ctx.user.id, sessionId);
        return { success: true, sessionId };
      } catch (error: any) {
        throw new Error(`Failed to create session: ${error.message}`);
      }
    }),

  /**
   * Get active sessions for a project
   */
  getActiveSessions: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.projectId !== "number") throw new Error("projectId must be number");
      return { projectId: obj.projectId };
    })
    .query(async ({ input }: any) => {
      try {
        return await getActiveSessions(input.projectId);
      } catch (error: any) {
        throw new Error(`Failed to get active sessions: ${error.message}`);
      }
    }),

  /**
   * End a session
   */
  endSession: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.sessionId !== "string") throw new Error("sessionId must be string");
      return { sessionId: obj.sessionId };
    })
    .mutation(async ({ input }: any) => {
      try {
        await removeActiveSession(input.sessionId);
        return { success: true };
      } catch (error: any) {
        throw new Error(`Failed to end session: ${error.message}`);
      }
    }),

  /**
   * Update session activity
   */
  updateSessionActivity: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.sessionId !== "string") throw new Error("sessionId must be string");
      return { sessionId: obj.sessionId };
    })
    .mutation(async ({ input }: any) => {
      try {
        await updateSessionActivity(input.sessionId);
        return { success: true };
      } catch (error: any) {
        throw new Error(`Failed to update session activity: ${error.message}`);
      }
    }),
});
