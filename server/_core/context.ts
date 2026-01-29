import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Try local authentication first
    const cookies = (opts.req as any).cookies || {};
    const sessionToken = cookies[COOKIE_NAME];
    if (sessionToken) {
      user = await sdk.verifySession(sessionToken) as any;
      if (user) {
        // Fetch full user from DB to ensure all fields are present
        const { getUserById } = await import("../auth");
        const fullUser = await getUserById((user as any).id || (user as any).openId);
        if (fullUser) {
          user = fullUser as any;
        }
      }
    }

    // Fallback to SDK if needed (optional)
    if (!user) {
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
