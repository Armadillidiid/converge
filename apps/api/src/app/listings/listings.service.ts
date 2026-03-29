import { Injectable, NotFoundException } from "@nestjs/common";
import type { ListingOutput, ListListingsInput } from "./listings.contract.js";

type ListListingsResult = {
  items: ListingOutput[];
  total: number;
  page: number;
  pageSize: number;
};

const mockListings: ListingOutput[] = [
  {
    id: "listing-1",
    title: "3 Bedroom Apartment in Lekki Phase 1",
    description:
      "Spacious serviced apartment with modern kitchen, parking, and 24/7 power.",
    price: 6500000,
    city: "Lagos",
    state: "Lagos",
    propertyType: "apartment",
    listingType: "rent",
    bedrooms: 3,
    bathrooms: 3,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    agentId: null,
  },
  {
    id: "listing-2",
    title: "4 Bedroom Detached House in Ikeja GRA",
    description:
      "Well-finished detached house with BQ and large compound in a secure estate.",
    price: 185000000,
    city: "Lagos",
    state: "Lagos",
    propertyType: "house",
    listingType: "sale",
    bedrooms: 4,
    bathrooms: 5,
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    agentId: null,
  },
  {
    id: "listing-3",
    title: "Commercial Space in Victoria Island",
    description:
      "Open-plan office floor close to major business district with parking slots.",
    price: 12000000,
    city: "Lagos",
    state: "Lagos",
    propertyType: "commercial",
    listingType: "rent",
    bedrooms: null,
    bathrooms: 2,
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    agentId: null,
  },
];

@Injectable()
export class ListingsService {
  async findAll(filters: ListListingsInput): Promise<ListListingsResult> {
    const page = filters.page;
    const pageSize = filters.pageSize;

    let filteredListings = [...mockListings];

    if (filters.city) {
      filteredListings = filteredListings.filter(
        (item) => item.city.toLowerCase() === filters.city?.toLowerCase(),
      );
    }

    if (filters.propertyType) {
      filteredListings = filteredListings.filter(
        (item) => item.propertyType === filters.propertyType,
      );
    }

    if (filters.listingType) {
      filteredListings = filteredListings.filter(
        (item) => item.listingType === filters.listingType,
      );
    }

    const offset = (page - 1) * pageSize;
    const items = filteredListings.slice(offset, offset + pageSize);

    return {
      items,
      total: filteredListings.length,
      page,
      pageSize,
    };
  }

  async findById(id: string): Promise<ListingOutput> {
    const listing = mockListings.find((item) => item.id === id);

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    return listing;
  }
}
