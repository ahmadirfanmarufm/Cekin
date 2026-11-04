CREATE TABLE "cekin_community_comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cekin_community_comment_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"source" varchar(20) DEFAULT 'upload' NOT NULL,
	"media_type" varchar(20) NOT NULL,
	"storage_path" text,
	"external_url" text,
	"mime_type" varchar(100) NOT NULL,
	"file_size" integer DEFAULT 0 NOT NULL,
	"duration" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cekin_community_comment_likes" ADD CONSTRAINT "cekin_community_comment_likes_comment_id_cekin_community_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."cekin_community_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_comment_likes" ADD CONSTRAINT "cekin_community_comment_likes_user_id_cekin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cekin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_community_comment_media" ADD CONSTRAINT "cekin_community_comment_media_comment_id_cekin_community_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."cekin_community_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_community_comment_likes_unique" ON "cekin_community_comment_likes" USING btree ("comment_id","user_id");--> statement-breakpoint
CREATE INDEX "cekin_community_comment_likes_comment_idx" ON "cekin_community_comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_community_comment_media_comment_unique" ON "cekin_community_comment_media" USING btree ("comment_id");