ALTER TABLE "auth_session" ADD COLUMN "active_expires" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_session" ADD COLUMN "idle_expires" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_session" DROP COLUMN "expires_at";