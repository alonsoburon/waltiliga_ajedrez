CREATE TABLE "divisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rank" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"white_id" integer NOT NULL,
	"black_id" integer NOT NULL,
	"result" smallint DEFAULT 0,
	"played_at" timestamp with time zone NOT NULL,
	"week" smallint NOT NULL,
	"season_id" integer NOT NULL,
	"created_by" text NOT NULL,
	"cond1" boolean DEFAULT false,
	"cond2" boolean DEFAULT false,
	"cond3" boolean DEFAULT false,
	"cond4" boolean DEFAULT false,
	"cond5" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"starting_elo" integer DEFAULT 500,
	"active" boolean DEFAULT true,
	"division_id" integer
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"active" boolean DEFAULT true,
	"prize_url" text,
	"division_id" integer
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	"player_id" integer,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "weekly_pairings" (
	"id" serial PRIMARY KEY NOT NULL,
	"white_id" integer NOT NULL,
	"black_id" integer NOT NULL,
	"week" smallint NOT NULL,
	"season_id" integer NOT NULL,
	"game_id" integer,
	"status" smallint DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_white_id_players_id_fk" FOREIGN KEY ("white_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_black_id_players_id_fk" FOREIGN KEY ("black_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_pairings" ADD CONSTRAINT "weekly_pairings_white_id_players_id_fk" FOREIGN KEY ("white_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_pairings" ADD CONSTRAINT "weekly_pairings_black_id_players_id_fk" FOREIGN KEY ("black_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_pairings" ADD CONSTRAINT "weekly_pairings_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_pairings" ADD CONSTRAINT "weekly_pairings_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;