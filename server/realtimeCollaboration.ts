import { EventEmitter } from "events";

export interface CollaborationEvent {
  type: "edit" | "comment" | "join" | "leave" | "cursor";
  userId: number;
  userName: string;
  timestamp: number;
  data: any;
}

export interface CursorPosition {
  userId: number;
  userName: string;
  x: number;
  y: number;
  color: string;
}

export class RealtimeCollaborationManager extends EventEmitter {
  private activeUsers: Map<number, { name: string; color: string }> = new Map();
  private cursorPositions: Map<number, CursorPosition> = new Map();
  private eventHistory: CollaborationEvent[] = [];
  private readonly maxHistorySize = 1000;

  /**
   * User joins collaboration session
   */
  joinSession(userId: number, userName: string, color: string): void {
    this.activeUsers.set(userId, { name: userName, color });
    
    const event: CollaborationEvent = {
      type: "join",
      userId,
      userName,
      timestamp: Date.now(),
      data: { color },
    };
    
    this.recordEvent(event);
    this.emit("user-joined", event);
  }

  /**
   * User leaves collaboration session
   */
  leaveSession(userId: number): void {
    const user = this.activeUsers.get(userId);
    if (!user) return;

    this.activeUsers.delete(userId);
    this.cursorPositions.delete(userId);

    const event: CollaborationEvent = {
      type: "leave",
      userId,
      userName: user.name,
      timestamp: Date.now(),
      data: {},
    };

    this.recordEvent(event);
    this.emit("user-left", event);
  }

  /**
   * Record code edit
   */
  recordEdit(
    userId: number,
    userName: string,
    field: "html" | "css" | "javascript",
    content: string
  ): void {
    const event: CollaborationEvent = {
      type: "edit",
      userId,
      userName,
      timestamp: Date.now(),
      data: { field, content },
    };

    this.recordEvent(event);
    this.emit("code-edited", event);
  }

  /**
   * Record comment
   */
  recordComment(
    userId: number,
    userName: string,
    comment: string,
    lineNumber?: number
  ): void {
    const event: CollaborationEvent = {
      type: "comment",
      userId,
      userName,
      timestamp: Date.now(),
      data: { comment, lineNumber },
    };

    this.recordEvent(event);
    this.emit("comment-added", event);
  }

  /**
   * Update cursor position
   */
  updateCursorPosition(
    userId: number,
    userName: string,
    x: number,
    y: number,
    color: string
  ): void {
    const position: CursorPosition = { userId, userName, x, y, color };
    this.cursorPositions.set(userId, position);

    const event: CollaborationEvent = {
      type: "cursor",
      userId,
      userName,
      timestamp: Date.now(),
      data: { x, y, color },
    };

    this.emit("cursor-moved", event);
  }

  /**
   * Get active users
   */
  getActiveUsers(): Array<{ userId: number; name: string; color: string }> {
    return Array.from(this.activeUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data,
    }));
  }

  /**
   * Get cursor positions
   */
  getCursorPositions(): CursorPosition[] {
    return Array.from(this.cursorPositions.values());
  }

  /**
   * Get event history
   */
  getEventHistory(limit: number = 50): CollaborationEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Record event internally
   */
  private recordEvent(event: CollaborationEvent): void {
    this.eventHistory.push(event);
    
    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Clear session
   */
  clearSession(): void {
    this.activeUsers.clear();
    this.cursorPositions.clear();
    this.eventHistory = [];
    this.emit("session-cleared");
  }
}

// Global collaboration manager instance
export const collaborationManager = new RealtimeCollaborationManager();
