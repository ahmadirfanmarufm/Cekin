CREATE TABLE "cekin_community_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"is_helpful" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cekin_community_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cekin_community_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"category" varchar(40) NOT NULL,
	"title" varchar(150) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cekin_community_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(20) DEFAULT 'helpful' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cekin_community_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reason" varchar(50) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"media_type" varchar(20) NOT NULL,
	"duration" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cekin_community_comments" ADD CONSTRAINT "cekin_community_comments_post_id_cekin_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cekin_community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_comments" ADD CONSTRAINT "cekin_community_comments_author_id_cekin_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."cekin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_comments" ADD CONSTRAINT "cekin_community_comments_parent_id_cekin_community_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cekin_community_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_media" ADD CONSTRAINT "cekin_community_media_post_id_cekin_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cekin_community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_posts" ADD CONSTRAINT "cekin_community_posts_author_id_cekin_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."cekin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_reactions" ADD CONSTRAINT "cekin_community_reactions_post_id_cekin_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cekin_community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_reactions" ADD CONSTRAINT "cekin_community_reactions_user_id_cekin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cekin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_reports" ADD CONSTRAINT "cekin_community_reports_post_id_cekin_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cekin_community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_reports" ADD CONSTRAINT "cekin_community_reports_reporter_id_cekin_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."cekin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cekin_community_comments_post_idx" ON "cekin_community_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "cekin_community_comments_author_idx" ON "cekin_community_comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "cekin_community_comments_parent_idx" ON "cekin_community_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "cekin_community_media_post_idx" ON "cekin_community_media" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "cekin_community_posts_author_idx" ON "cekin_community_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "cekin_community_posts_category_idx" ON "cekin_community_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "cekin_community_posts_status_idx" ON "cekin_community_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cekin_community_posts_created_idx" ON "cekin_community_posts" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_community_reactions_unique" ON "cekin_community_reactions" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "cekin_community_reactions_post_idx" ON "cekin_community_reactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "cekin_community_reports_post_idx" ON "cekin_community_reports" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "cekin_community_reports_reporter_idx" ON "cekin_community_reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "cekin_community_reports_status_idx" ON "cekin_community_reports" USING btree ("status");