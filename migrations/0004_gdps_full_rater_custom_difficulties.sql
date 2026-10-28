CREATE TABLE "gdps_full_rater_custom_difficulties" (
	"level_id" integer PRIMARY KEY NOT NULL,
	"tier_key" text NOT NULL,
	"tier_name" text NOT NULL,
	"rated_by" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
