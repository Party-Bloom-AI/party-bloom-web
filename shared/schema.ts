import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    title: varchar("title").notNull(),
    description: text("description"),
    colors: jsonb("colors").$type<string[]>(),
    themeImage: text("theme_image"),
    moodboardImages: jsonb("moodboard_images").$type<string[]>(),
    decorItems: jsonb("decor_items").$type<{
      name: string;
      priceRange: string;
      retailer: string;
      link: string;
    }[]>(),
    totalCostRange: varchar("total_cost_range"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("IDX_favorites_user_id").on(table.userId)],
);

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
