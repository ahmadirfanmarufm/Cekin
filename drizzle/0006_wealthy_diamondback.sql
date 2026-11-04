CREATE TABLE "cekin_community_moderation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"moderator_id" uuid,
	"previous_verification_status" varchar(20),
	"new_verification_status" varchar(20) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cekin_community_moderation_logs" ADD CONSTRAINT "cekin_community_moderation_logs_post_id_cekin_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cekin_community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_moderation_logs" ADD CONSTRAINT "cekin_community_moderation_logs_moderator_id_cekin_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."cekin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cekin_community_moderation_logs_post_idx" ON "cekin_community_moderation_logs" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "cekin_community_moderation_logs_moderator_idx" ON "cekin_community_moderation_logs" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "cekin_community_moderation_logs_created_idx" ON "cekin_community_moderation_logs" USING btree ("created_at");