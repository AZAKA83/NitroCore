import {integer, pgTable, text, timestamp} from "drizzle-orm/pg-core";

export const gdpsFullRaterCustomDifficultiesTable = pgTable(
    "gdps_full_rater_custom_difficulties",
    {
        levelId: integer("level_id").primaryKey(),
        tierKey: text("tier_key").notNull(),
        tierName: text("tier_name").notNull(),
        ratedBy: integer("rated_by").notNull(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    }
);