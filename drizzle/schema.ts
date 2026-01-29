import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name"),
  passwordHash: text("passwordHash"), // For email/password auth
  loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Payments table - tracks all payments made by users
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  amount: int("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).unique(),
  status: varchar("status", { length: 64 }).default("pending"), // pending, succeeded, failed
  planId: int("plan_id").references(() => subscriptionPlans.id),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Subscription plans available in the system
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(), // Free, Personal, Team
  pricePerMonth: int("price_per_month").notNull(), // in cents (e.g., 2900 for $29)
  projectsPerMonth: int("projects_per_month").notNull(), // -1 for unlimited
  canDownload: int("can_download").notNull().default(0), // 0 = false, 1 = true
  features: text("features"), // JSON array of features
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User subscriptions - tracks current subscription for each user
 */
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  planId: int("plan_id").notNull().references(() => subscriptionPlans.id),
  status: mysqlEnum("status", ["active", "canceled", "expired"]).default("active").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  projectsUsedThisMonth: int("projects_used_this_month").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Projects created by users
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"), // Structured description
  generatedHtml: text("generated_html"), // Generated HTML code
  generatedCss: text("generated_css"), // Generated CSS code
  generatedJs: text("generated_js"), // Generated JavaScript code
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Invoices for billing
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  subscriptionId: int("subscription_id").notNull().references(() => userSubscriptions.id),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }).unique(),
  amount: int("amount").notNull(), // in cents
  status: mysqlEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).default("open").notNull(),
  pdfUrl: varchar("pdf_url", { length: 512 }),
  issuedAt: timestamp("issued_at"),
  dueAt: timestamp("due_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Project collaborators - tracks who has access to each project
 */
export const projectCollaborators = mysqlTable("project_collaborators", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projects.id),
  userId: int("user_id").notNull().references(() => users.id),
  role: mysqlEnum("role", ["owner", "editor", "viewer"]).default("editor").notNull(),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type InsertProjectCollaborator = typeof projectCollaborators.$inferInsert;

/**
 * Activity logs for tracking changes in collaborative projects
 */
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projects.id),
  userId: int("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 64 }).notNull(),
  fieldChanged: varchar("field_changed", { length: 64 }),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * Active sessions for real-time collaboration tracking
 */
export const activeSessions = mysqlTable("active_sessions", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projects.id),
  userId: int("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id", { length: 128 }).notNull().unique(),
  cursorPosition: int("cursor_position").default(0),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActiveSession = typeof activeSessions.$inferSelect;
export type InsertActiveSession = typeof activeSessions.$inferInsert;

/**
 * Project interfaces - supports multiple interfaces per project (Frontend, Backend, Mobile, API, Database)
 */
export const projectInterfaces = mysqlTable("project_interfaces", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Frontend", "Backend API", "Mobile App"
  type: mysqlEnum("type", ["frontend", "backend", "mobile", "api", "database"]).notNull(),
  language: varchar("language", { length: 64 }).notNull(), // React, Vue, Angular, Svelte, HTML, Node.js, Python, PHP, Java, C#
  framework: varchar("framework", { length: 64 }), // e.g., Express, Flask, Laravel, Spring Boot, .NET
  description: text("description"), // Interface description
  generatedCode: text("generated_code"), // Generated code for this interface
  dependencies: text("dependencies"), // JSON array of dependencies
  version: varchar("version", { length: 32 }).default("1.0.0"),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectInterface = typeof projectInterfaces.$inferSelect;
export type InsertProjectInterface = typeof projectInterfaces.$inferInsert;

/**
 * Interface links - tracks dependencies between interfaces
 */
export const interfaceLinks = mysqlTable("interface_links", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sourceInterfaceId: int("source_interface_id").notNull().references(() => projectInterfaces.id, { onDelete: "cascade" }),
  targetInterfaceId: int("target_interface_id").notNull().references(() => projectInterfaces.id, { onDelete: "cascade" }),
  linkType: mysqlEnum("link_type", ["calls", "depends_on", "extends", "implements", "communicates_with"]).notNull(),
  description: text("description"), // Description of the relationship
  apiEndpoint: varchar("api_endpoint", { length: 512 }), // For API calls
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InterfaceLink = typeof interfaceLinks.$inferSelect;
export type InsertInterfaceLink = typeof interfaceLinks.$inferInsert;
