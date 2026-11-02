CREATE TABLE "cekin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cekin_simulation_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"simulation_id" varchar(50) NOT NULL,
	"xp_earned" integer DEFAULT 50 NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cekin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(30) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
DROP TABLE "simulation_progress" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "cekin_sessions" ADD CONSTRAINT "cekin_sessions_user_id_cekin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cekin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cekin_simulation_progress" ADD CONSTRAINT "cekin_simulation_progress_user_id_cekin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cekin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_sessions_token_hash_unique" ON "cekin_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "cekin_sessions_user_id_idx" ON "cekin_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cekin_sessions_expires_at_idx" ON "cekin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_simulation_progress_user_simulation_unique" ON "cekin_simulation_progress" USING btree ("user_id","simulation_id");--> statement-breakpoint
CREATE INDEX "cekin_simulation_progress_user_id_idx" ON "cekin_simulation_progress" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_users_username_unique" ON "cekin_users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "cekin_users_email_unique" ON "cekin_users" USING btree ("email");