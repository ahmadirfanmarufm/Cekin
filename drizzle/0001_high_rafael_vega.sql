CREATE TABLE "simulation_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"simulation_id" varchar(50) NOT NULL,
	"xp_earned" integer DEFAULT 50 NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simulation_progress" ADD CONSTRAINT "simulation_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "simulation_progress_user_simulation_unique" ON "simulation_progress" USING btree ("user_id","simulation_id");--> statement-breakpoint
CREATE INDEX "simulation_progress_user_id_idx" ON "simulation_progress" USING btree ("user_id");