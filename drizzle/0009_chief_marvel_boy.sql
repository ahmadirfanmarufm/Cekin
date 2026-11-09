CREATE TABLE "cekin_user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_id" varchar(50) NOT NULL,
	"simulation_id" varchar(50) NOT NULL,
	"mistakes" integer DEFAULT 0 NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cekin_user_badges" ADD CONSTRAINT "cekin_user_badges_user_id_cekin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cekin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_user_badges_user_badge_unique" ON "cekin_user_badges" USING btree ("user_id","badge_id");--> statement-breakpoint
CREATE INDEX "cekin_user_badges_user_idx" ON "cekin_user_badges" USING btree ("user_id");