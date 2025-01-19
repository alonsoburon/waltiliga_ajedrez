CREATE TABLE "auth_key" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"hashed_password" text
);
--> statement-breakpoint
ALTER TABLE "session" RENAME TO "auth_session";--> statement-breakpoint
ALTER TABLE "user" RENAME TO "auth_user";--> statement-breakpoint
ALTER TABLE "auth_user" DROP CONSTRAINT "user_username_unique";--> statement-breakpoint
ALTER TABLE "games" DROP CONSTRAINT "games_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_key" ADD CONSTRAINT "auth_key_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_created_by_auth_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_user" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "auth_user" ADD CONSTRAINT "auth_user_username_unique" UNIQUE("username");