import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  index,
  AnyPgColumn,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "cekin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    username: varchar("username", { length: 30 }).notNull(),

    role: varchar("role", { length: 20 }).notNull().default("user"),

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

export const communityPosts = pgTable(
  "cekin_community_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    category: varchar("category", { length: 40 }).notNull(),

    title: varchar("title", { length: 150 }).notNull(),

    content: text("content").notNull(),

    status: varchar("status", { length: 20 }).notNull().default("published"),

    verificationStatus: varchar("verification_status", {
      length: 20,
    }).notNull().default("unverified"),

    reviewedBy: uuid("reviewed_by").references(() => users.id,
      { onDelete: "set null" }
    ),

    reviewedAt: timestamp("reviewed_at", {
      withTimezone: true,
    }),

    reviewNote: text("review_note"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow().notNull(),

    editedAt: timestamp("edited_at", { withTimezone: true }),
  },
  (table) => [
    index("cekin_community_posts_author_idx").on(table.authorId),
    index("cekin_community_posts_category_idx").on(table.category),
    index("cekin_community_posts_status_idx").on(table.status),
    index("cekin_community_posts_created_idx").on(table.createdAt),
    index("cekin_community_posts_verification_idx").on(table.verificationStatus),
    index("cekin_community_posts_reviewed_by_idx").on(table.reviewedBy),
  ],
);

export const communityMedia = pgTable("cekin_community_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),

    storagePath: text("storage_path").notNull(),

    mediaType: varchar("media_type", {
      length: 20,
    }).notNull(),

    mimeType: varchar("mime_type", {
      length: 100,
    }).notNull(),

    fileSize: integer("file_size").notNull(),

    duration: integer("duration"),

    position: integer("position").notNull().default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    index("cekin_community_media_post_idx").on(table.postId),
  ],
);

export const communityComments = pgTable(
  "cekin_community_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),

    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    parentId: uuid("parent_id").references(
      (): AnyPgColumn => communityComments.id,
      { onDelete: "cascade" },
    ),

    content: text("content").notNull(),

    isHelpful: boolean("is_helpful").notNull().default(false),

    status: varchar("status", { length: 20 })
      .notNull()
      .default("published"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    index("cekin_community_comments_post_idx").on(table.postId),
    index("cekin_community_comments_author_idx").on(table.authorId),
    index("cekin_community_comments_parent_idx").on(table.parentId),
  ],
);


export const communityReactions = pgTable(
  "cekin_community_reactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 20 })
      .notNull()
      .default("helpful"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cekin_community_reactions_unique").on(
      table.postId,
      table.userId,
    ),
    index("cekin_community_reactions_post_idx").on(table.postId),
  ],
);

export const communityReports = pgTable("cekin_community_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),

    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    reason: varchar("reason", {
      length: 50,
    }).notNull(),

    description: text("description"),

    status: varchar("status", {
      length: 20,
    }).notNull().default("pending"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    index("cekin_community_reports_post_idx").on(table.postId),
    index("cekin_community_reports_reporter_idx").on(table.reporterId),
    index("cekin_community_reports_status_idx").on(table.status),
    uniqueIndex("cekin_community_reports_post_reporter_unique").on(table.postId, table.reporterId),
  ],
);

export const communityModerationLogs = pgTable("cekin_community_moderation_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("post_id")
      .notNull()
      .references(() => communityPosts.id, {
        onDelete: "cascade",
      }),

    moderatorId: uuid("moderator_id").references(
      () => users.id,
      {
        onDelete: "set null",
      },
    ),

    previousVerificationStatus: varchar(
      "previous_verification_status",
      { length: 20 },
    ),

    newVerificationStatus: varchar(
      "new_verification_status",
      { length: 20 },
    ).notNull(),

    note: text("note"),

    eventType: varchar("event_type", { length: 20 }).notNull().default("review"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("cekin_community_moderation_logs_post_idx").on(
      table.postId,
    ),
    index("cekin_community_moderation_logs_moderator_idx").on(
      table.moderatorId,
    ),
    index("cekin_community_moderation_logs_created_idx").on(
      table.createdAt,
    ),
  ],
);

export const communityCommentMedia = pgTable(
  "cekin_community_comment_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    commentId: uuid("comment_id")
      .notNull()
      .references(() => communityComments.id, { onDelete: "cascade" }),

    source: varchar("source", { length: 20 }).notNull().default("upload"),
    
    mediaType: varchar("media_type", { length: 20 }).notNull(),

    storagePath: text("storage_path"),
    externalUrl: text("external_url"),

    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: integer("file_size").notNull().default(0),
    duration: integer("duration"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cekin_community_comment_media_comment_unique").on(table.commentId),
  ],
);

export const communityCommentLikes = pgTable(
  "cekin_community_comment_likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    commentId: uuid("comment_id")
      .notNull()
      .references(() => communityComments.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cekin_community_comment_likes_unique").on(table.commentId, table.userId),
    index("cekin_community_comment_likes_comment_idx").on(table.commentId),
  ],
);

export const communityNotifications = pgTable(
  "cekin_community_notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 30 }).notNull(),

    groupKey: varchar("group_key", { length: 100 }).notNull(),

    postId: uuid("post_id").references(() => communityPosts.id, { onDelete: "cascade" }),

    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),

    count: integer("count").notNull().default(1),

    meta: varchar("meta", { length: 100 }),

    readAt: timestamp("read_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cekin_community_notifications_group_unique").on(table.userId, table.groupKey),
    index("cekin_community_notifications_user_idx").on(table.userId, table.updatedAt),
  ],
);

export const userBadges = pgTable(
  "cekin_user_badges",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    badgeId: varchar("badge_id", { length: 50 }).notNull(),
    simulationId: varchar("simulation_id", { length: 50 }).notNull(),

    mistakes: integer("mistakes").notNull().default(0),

    earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cekin_user_badges_user_badge_unique").on(table.userId, table.badgeId),
    index("cekin_user_badges_user_idx").on(table.userId),
  ],
);