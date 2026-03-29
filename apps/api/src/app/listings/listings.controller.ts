import { Controller, Get, Param, Query } from "@nestjs/common";
import { AllowAnonymous } from "#src/modules/better-auth/decorators.js";
import {
  getListingByIdInputSchema,
  listListingsInputSchema,
  type ListListingsInput,
  type ListingOutput,
} from "./listings.contract.js";
import { ListingsService } from "./listings.service.js";

type ListListingsResponse = {
  items: ListingOutput[];
  total: number;
  page: number;
  pageSize: number;
};

@Controller("listings")
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @AllowAnonymous()
  @Get()
  getListings(
    @Query() query: ListListingsInput,
  ): Promise<ListListingsResponse> {
    const input = listListingsInputSchema.parse(query);
    return this.listingsService.findAll(input);
  }

  @AllowAnonymous()
  @Get(":id")
  getListingById(@Param("id") id: string): Promise<ListingOutput> {
    const input = getListingByIdInputSchema.parse({ id });
    return this.listingsService.findById(input.id);
  }
}
