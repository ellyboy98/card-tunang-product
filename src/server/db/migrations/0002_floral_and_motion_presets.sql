ALTER TABLE "settings" ADD COLUMN "floral_preset" text DEFAULT 'peony_corners' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "entrance_preset" text DEFAULT 'petal_fall' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "wind_preset" text DEFAULT 'gentle' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "reveal_preset" text DEFAULT 'fade_up' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "cover_transition";--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "petal_style";--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "petal_density";