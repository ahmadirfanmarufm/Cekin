ALTER TABLE "cekin_community_posts" ADD COLUMN "reviewed_by" uuid;--> statement-breakpoint
ALTER TABLE "cekin_community_posts" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cekin_community_posts" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "cekin_users" ADD COLUMN "role" varchar(20) DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "cekin_community_posts" ADD CONSTRAINT "cekin_community_posts_reviewed_by_cekin_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."cekin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cekin_community_posts_verification_idx" ON "cekin_community_posts" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "cekin_community_posts_reviewed_by_idx" ON "cekin_community_posts" USING btree ("reviewed_by");