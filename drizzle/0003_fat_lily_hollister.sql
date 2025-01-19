ALTER TABLE "games" ALTER COLUMN "played_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "start_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "end_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "auth_session" ALTER COLUMN "expires_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "auth_user" ADD COLUMN "password_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_user" DROP COLUMN "player_id";