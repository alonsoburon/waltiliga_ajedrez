// src/lib/server/db/schema.ts
import {
	pgTable,
	serial,
	text,
	integer,
	boolean,
	smallint,
	timestamp,
	bigint
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Auth tables
export const user = pgTable('auth_user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	isAdmin: boolean('is_admin').default(false)
});

export const session = pgTable('auth_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	activeExpires: bigint('active_expires', {
		mode: 'bigint'
	}).notNull(),
	idleExpires: bigint('idle_expires', {
		mode: 'bigint'
	}).notNull()
});

export const key = pgTable('auth_key', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	hashedPassword: text('hashed_password')
});

// Core tables
export const divisions = pgTable('divisions', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	rank: smallint('rank').notNull()
});

export const players = pgTable('players', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	startingElo: integer('starting_elo').default(500),
	active: boolean('active').default(true),
	divisionId: integer('division_id').references(() => divisions.id)
});

export const seasons = pgTable('seasons', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	startDate: timestamp('start_date').notNull(),
	endDate: timestamp('end_date').notNull(),
	active: boolean('active').default(true),
	prizeUrl: text('prize_url')
});

export const games = pgTable('games', {
	id: serial('id').primaryKey(),
	whiteId: integer('white_id')
		.references(() => players.id)
		.notNull(),
	blackId: integer('black_id')
		.references(() => players.id)
		.notNull(),
	result: smallint('result').default(0),
	playedAt: timestamp('played_at').notNull(),
	week: smallint('week').notNull(),
	seasonId: integer('season_id')
		.references(() => seasons.id)
		.notNull(),
	createdBy: text('created_by')
		.references(() => user.id)
		.notNull(),
	cond1: boolean('cond1').default(false),
	cond2: boolean('cond2').default(false),
	cond3: boolean('cond3').default(false),
	cond4: boolean('cond4').default(false),
	cond5: boolean('cond5').default(false)
});

export const weeklyPairings = pgTable('weekly_pairings', {
	id: serial('id').primaryKey(),
	whiteId: integer('white_id')
		.references(() => players.id)
		.notNull(),
	blackId: integer('black_id')
		.references(() => players.id)
		.notNull(),
	week: smallint('week').notNull(),
	seasonId: integer('season_id')
		.references(() => seasons.id)
		.notNull(),
	gameId: integer('game_id').references(() => games.id),
	status: smallint('status').default(0)
});

// Relations
export const userRelations = relations(user, ({ one }) => ({
	player: one(players, {
		fields: [user.id],
		references: [players.id]
	})
}));

export const playerRelations = relations(players, ({ one, many }) => ({
	division: one(divisions, {
		fields: [players.divisionId],
		references: [divisions.id]
	}),
	gamesAsWhite: many(games, {
		fields: [players.id],
		references: [games.whiteId],
		relationName: 'playerWhiteGames'
	}),
	gamesAsBlack: many(games, {
		fields: [players.id],
		references: [games.blackId],
		relationName: 'playerBlackGames'
	})
}));

export const gameRelations = relations(games, ({ one }) => ({
	whitePlayer: one(players, {
		fields: [games.whiteId],
		references: [players.id],
		relationName: 'playerWhiteGames'
	}),
	blackPlayer: one(players, {
		fields: [games.blackId],
		references: [players.id],
		relationName: 'playerBlackGames'
	}),
	season: one(seasons, {
		fields: [games.seasonId],
		references: [seasons.id]
	}),
	creator: one(user, {
		fields: [games.createdBy],
		references: [user.id]
	})
}));

// Types
export type User = typeof user.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Season = typeof seasons.$inferSelect;
export type Division = typeof divisions.$inferSelect;
