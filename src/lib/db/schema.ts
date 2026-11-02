
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "cekin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    username: varchar("username", { length: 30 }).notNull(),

    email: varchar("email", { length: 255 }).notNull(),

    passwordHash: text("password_hash").notNull(),

    totalXp: integer("total_xp").notNull().default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cekin_users_username_unique").on(table.username),
    uniqueIndex("cekin_users_email_unique").on(table.email),
  ]
);

export const sessions = pgTable(
  "cekin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    tokenHash: text("token_hash").notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cekin_sessions_token_hash_unique").on(table.tokenHash),
    index("cekin_sessions_user_id_idx").on(table.userId),
    index("cekin_sessions_expires_at_idx").on(table.expiresAt),
  ]
);

export const simulationProgress = pgTable(
  "cekin_simulation_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    simulationId: varchar("simulation_id", { length: 50 }).notNull(),

    xpEarned: integer("xp_earned").notNull().default(50),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cekin_simulation_progress_user_simulation_unique").on(
      table.userId,
      table.simulationId
    ),
    index("cekin_simulation_progress_user_id_idx").on(table.userId),
  ]
);
