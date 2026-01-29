import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema";
import { nanoid } from "nanoid";
import * as crypto from "crypto";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Hash password using bcrypt-like approach
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(":");
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return computedHash === storedHash;
}

/**
 * Register new user
 */
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<{ success: boolean; userId?: number; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Email already registered" };
    }

    // Create new user
    const hashedPassword = hashPassword(data.password);
    const userId = nanoid(12);

    await db.insert(users).values({
      openId: userId,
      email: data.email,
      name: data.name,
      passwordHash: hashedPassword,
      loginMethod: "email",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    // Get the created user
    const newUser = await db
      .select()
      .from(users)
      .where(eq(users.openId, userId))
      .limit(1);

    return {
      success: true,
      userId: newUser[0]?.id,
    };
  } catch (error) {
    console.error("[Auth] Registration failed:", error);
    return { success: false, error: "Registration failed" };
  }
}

/**
 * Login user
 */
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: any; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: "Invalid email or password" };
    }

    const userData = user[0];
    if (!userData.passwordHash) {
      return { success: false, error: "Invalid email or password" };
    }

    if (!verifyPassword(data.password, userData.passwordHash)) {
      return { success: false, error: "Invalid email or password" };
    }

    // Update last signed in
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, userData.id));

    return {
      success: true,
      user: {
        id: userData.id,
        openId: userData.openId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
    };
  } catch (error) {
    console.error("[Auth] Login failed:", error);
    return { success: false, error: "Login failed" };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user[0] || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user[0] || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: number,
  data: { name?: string; email?: string }
) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return true;
  } catch (error) {
    console.error("[Auth] Update failed:", error);
    return false;
  }
}

/**
 * Change password
 */
export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    const user = await getUserById(userId);
    if (!user || !user.passwordHash) {
      return { success: false, error: "User not found" };
    }

    if (!verifyPassword(oldPassword, user.passwordHash)) {
      return { success: false, error: "Current password is incorrect" };
    }

    const hashedPassword = hashPassword(newPassword);
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error("[Auth] Change password failed:", error);
    return { success: false, error: "Failed to change password" };
  }
}
