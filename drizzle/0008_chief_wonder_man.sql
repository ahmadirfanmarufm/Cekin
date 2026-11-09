CREATE TABLE "cekin_community_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"group_key" varchar(100) NOT NULL,
	"post_id" uuid,
	"actor_id" uuid,
	"count" integer DEFAULT 1 NOT NULL,
	"meta" varchar(100),
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cekin_community_moderation_logs" ADD COLUMN "event_type" varchar(20) DEFAULT 'review' NOT NULL;--> statement-breakpoint
ALTER TABLE "cekin_community_posts" ADD COLUMN "edited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cekin_community_notifications" ADD CONSTRAINT "cekin_community_notifications_user_id_cekin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cekin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_notifications" ADD CONSTRAINT "cekin_community_notifications_post_id_cekin_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cekin_community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_notifications" ADD CONSTRAINT "cekin_community_notifications_actor_id_cekin_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."cekin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_community_notifications_group_unique" ON "cekin_community_notifications" USING btree ("user_id","group_key");--> statement-breakpoint
CREATE INDEX "cekin_community_notifications_user_idx" ON "cekin_community_notifications" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_community_reports_post_reporter_unique" ON "cekin_community_reports" USING btree ("post_id","reporter_id");