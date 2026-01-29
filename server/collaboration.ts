import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  projectCollaborators,
  activityLogs,
  activeSessions,
  InsertProjectCollaborator,
  InsertActivityLog,
  InsertActiveSession,
} from "../drizzle/schema";

/**
 * Add a collaborator to a project
 */
export async function addCollaborator(
  projectId: number,
  userId: number,
  role: "owner" | "editor" | "viewer" = "editor"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(projectCollaborators).values({
    projectId,
    userId,
    role,
    status: "pending",
  });
}

/**
 * Accept collaboration invitation
 */
export async function acceptCollaborationInvite(
  projectId: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(projectCollaborators)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
    })
    .where(
      and(
        eq(projectCollaborators.projectId, projectId),
        eq(projectCollaborators.userId, userId)
      )
    );
}

/**
 * Get all collaborators for a project
 */
export async function getProjectCollaborators(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(projectCollaborators)
    .where(eq(projectCollaborators.projectId, projectId));
}

/**
 * Remove a collaborator from a project
 */
export async function removeCollaborator(
  projectId: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(projectCollaborators)
    .where(
      and(
        eq(projectCollaborators.projectId, projectId),
        eq(projectCollaborators.userId, userId)
      )
    );
}

/**
 * Check if user has access to project
 */
export async function hasProjectAccess(
  projectId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(projectCollaborators)
    .where(
      and(
        eq(projectCollaborators.projectId, projectId),
        eq(projectCollaborators.userId, userId),
        eq(projectCollaborators.status, "accepted")
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Log activity for a project
 */
export async function logActivity(
  projectId: number,
  userId: number,
  action: string,
  fieldChanged?: string,
  oldValue?: string,
  newValue?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(activityLogs).values({
    projectId,
    userId,
    action,
    fieldChanged,
    oldValue,
    newValue,
  });
}

/**
 * Get activity logs for a project
 */
export async function getActivityLogs(projectId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.projectId, projectId))
    .orderBy((t) => t.createdAt)
    .limit(limit);
}

/**
 * Create an active session
 */
export async function createActiveSession(
  projectId: number,
  userId: number,
  sessionId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(activeSessions).values({
    projectId,
    userId,
    sessionId,
  });
}

/**
 * Get active sessions for a project
 */
export async function getActiveSessions(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(activeSessions)
    .where(eq(activeSessions.projectId, projectId));
}

/**
 * Remove an active session
 */
export async function removeActiveSession(sessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(activeSessions)
    .where(eq(activeSessions.sessionId, sessionId));
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(activeSessions)
    .set({ lastActivity: new Date() })
    .where(eq(activeSessions.sessionId, sessionId));
}
