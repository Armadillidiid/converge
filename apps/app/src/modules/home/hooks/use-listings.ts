import { useQuery } from "@tanstack/react-query";
import { type ListingsListData } from "@repo/sdk";
import { listingsListOptions } from "@repo/sdk/tanstack";

export function useListings(query: ListingsListData["query"]) {
  return useQuery(listingsListOptions({ query }));
}
