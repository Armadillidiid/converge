import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth.js";

export const propertyTypeEnum = pgEnum("property_type", [
  "apartment",
  "house",
  "land",
  "commercial",
]);

export const listingTypeEnum = pgEnum("listing_type", ["rent", "sale"]);

export const listingStatusEnum = pgEnum("listing_status", [
  "active",
  "inactive",
]);

export const listing = pgTable("listing", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  listingType: listingTypeEnum("listing_type").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  images: text("images").array(),
  status: listingStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  agentId: text("agent_id").references(() => user.id, {
    onDelete: "set null",
  }),
});
