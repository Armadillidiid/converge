import { oc } from "@orpc/contract";
import { z } from "zod";

export const listingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  city: z.string(),
  state: z.string(),
  propertyType: z.enum(["apartment", "house", "land", "commercial"]),
  listingType: z.enum(["rent", "sale"]),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().int().nullable(),
  images: z.array(z.string()),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  agentId: z.string().nullable(),
});

export const listListingsInputSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  city: z.string().optional(),
  propertyType: z.enum(["apartment", "house", "land", "commercial"]).optional(),
  listingType: z.enum(["rent", "sale"]).optional(),
});

export const listListingsOutputSchema = z.object({
  items: z.array(listingSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export const getListingByIdInputSchema = z.object({
  id: z.string().min(1),
});

export const listingsContract = {
  list: oc
    .route({ method: "GET", path: "/listings" })
    .input(listListingsInputSchema)
    .output(listListingsOutputSchema),
  getById: oc
    .route({ method: "GET", path: "/listings/{id}" })
    .input(getListingByIdInputSchema)
    .output(listingSchema),
};

export type ListListingsInput = z.infer<typeof listListingsInputSchema>;
export type ListingOutput = z.infer<typeof listingSchema>;
