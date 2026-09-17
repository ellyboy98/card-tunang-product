CREATE TYPE "public"."host_side" AS ENUM('bride', 'groom');--> statement-breakpoint
CREATE TYPE "public"."rsvp_status" AS ENUM('pending', 'attending', 'declined');--> statement-breakpoint
CREATE TABLE "guests" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"group_name" text DEFAULT 'Lain-lain' NOT NULL,
	"pax" integer DEFAULT 1 NOT NULL,
	"confirmed_pax" integer,
	"status" "rsvp_status" DEFAULT 'pending' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guests_pax_positive" CHECK ("guests"."pax" >= 1 AND "guests"."pax" <= 50),
	CONSTRAINT "guests_confirmed_le_pax" CHECK ("guests"."confirmed_pax" IS NULL OR ("guests"."confirmed_pax" >= 0 AND "guests"."confirmed_pax" <= "guests"."pax"))
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"title" text DEFAULT 'Majlis Pertunangan' NOT NULL,
	"bride_name" text DEFAULT '' NOT NULL,
	"groom_name" text DEFAULT '' NOT NULL,
	"bride_parents" text DEFAULT '' NOT NULL,
	"groom_parents" text DEFAULT '' NOT NULL,
	"host_side" "host_side" DEFAULT 'bride' NOT NULL,
	"opening_text" text DEFAULT 'Dengan penuh kesyukuran ke hadrat Ilahi, kami mempersilakan tuan/puan ke majlis pertunangan anakanda kami' NOT NULL,
	"closing_text" text DEFAULT 'Kehadiran dan doa restu tuan/puan amat kami hargai.' NOT NULL,
	"hashtag" text,
	"event_start_at" timestamp with time zone,
	"event_end_at" timestamp with time zone,
	"venue_name" text DEFAULT '' NOT NULL,
	"venue_address" text DEFAULT '' NOT NULL,
	"venue_lat" double precision,
	"venue_lng" double precision,
	"schedule" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"contacts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"music_url" text,
	"background_url" text,
	"font_preset" text DEFAULT 'classic' NOT NULL,
	"color_preset" text DEFAULT 'blush' NOT NULL,
	"is_rsvp_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_singleton" CHECK ("settings"."id" = 1)
);
--> statement-breakpoint
CREATE INDEX "guests_group_sort_idx" ON "guests" USING btree ("group_name","sort_order","label");