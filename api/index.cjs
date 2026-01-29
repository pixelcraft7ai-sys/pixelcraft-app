const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const { initTRPC, TRPCError } = require('@trpc/server');
const superjson = require('superjson');
const { z } = require('zod');
const mysql = require('mysql2/promise');
const { drizzle } = require('drizzle-orm/mysql2');
const { eq } = require('drizzle-orm');
const { nanoid } = require('nanoid');
const crypto = require('crypto');
const { mysqlTable, int, varchar, text, timestamp, mysqlEnum } = require('drizzle-orm/mysql-core');

// --- Schema Definition ---
const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name"),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  price: int("price").notNull(),
  features: text("features"),
});

const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  planId: int("planId").notNull(),
  status: varchar("status", { length: 64 }).notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
});

// --- Database Setup ---
const DATABASE_URL = process.env.DATABASE_URL;
let _pool = null;
const getDb = () => {
  if (!_pool && DATABASE_URL) {
    _pool = mysql.createPool(DATABASE_URL);
  }
  return _pool ? drizzle(_pool) : null;
};

// --- Auth Utilities ---
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, hash) => {
  const [salt, storedHash] = hash.split(":");
  const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return computedHash === storedHash;
};

// --- tRPC Setup ---
const t = initTRPC.create({ transformer: superjson });
const router = t.router;
const publicProcedure = t.procedure;

const appRouter = router({
  auth: router({
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        
        const user = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (user.length === 0 || !user[0].passwordHash || !verifyPassword(input.password, user[0].passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        
        return { success: true, user: { id: user[0].id, email: user[0].email, name: user[0].name } };
      }),
    register: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string(), name: z.string() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        
        const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (existing.length > 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already registered" });
        
        const openId = nanoid(12);
        await db.insert(users).values({
          openId,
          email: input.email,
          name: input.name,
          passwordHash: hashPassword(input.password),
          loginMethod: "email",
          role: "user",
        });
        
        const newUser = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
        if (newUser.length > 0) {
          const freePlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, "Free")).limit(1);
          if (freePlan.length > 0) {
            await db.insert(userSubscriptions).values({ userId: newUser[0].id, planId: freePlan[0].id, status: "active" });
          }
        }
        
        return { success: true };
      }),
  }),
  health: publicProcedure.query(() => ({ status: "ok" })),
});

// --- Vercel Serverless Function Handler ---
const trpcHandler = createExpressMiddleware({
  router: appRouter,
  createContext: () => ({}),
});

module.exports = (req, res) => {
  if (req.url.includes('/api/health')) {
    return res.status(200).json({ status: 'ok' });
  }
  
  if (req.url.includes('/api/trpc')) {
    req.url = req.url.split('/api/trpc')[1] || '/';
    return trpcHandler(req, res);
  }

  return res.status(404).json({ error: 'Not Found', url: req.url });
};
