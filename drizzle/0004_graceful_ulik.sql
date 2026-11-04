ALTER TABLE "cekin_community_media" ADD COLUMN "media_type" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "cekin_community_media" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "cekin_community_posts" ADD COLUMN "verification_status" varchar(20) DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE "cekin_community_reports" DROP COLUMN "media_type";--> statement-breakpoint
ALTER TABLE "cekin_community_reports" DROP COLUMN "duration";