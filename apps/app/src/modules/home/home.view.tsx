"use client";

import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Nav } from "@/shared/components/nav";
import { auth } from "@/shared/lib/auth";
import { ListingCard } from "./components/listing-card";
import { useListings } from "./hooks/use-listings";

export function HomeView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data, isPending } = useListings({
    page: 1,
    pageSize: 20,
  });
  const listings = data?.items ?? [];

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      const result = await auth.getSession();

      if (cancelled) {
        return;
      }

      setIsAuthenticated(!!result.data?.user);
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(170deg,_#fff7ed_0%,_#fffbeb_28%,_#ffffff_72%)]">
      <Nav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <header className="mb-8 space-y-3">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            Explore listings
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900 md:text-4xl">
            Homes across Lagos and nearby cities
          </h1>
          <p className="max-w-3xl text-sm text-neutral-600 md:text-base">
            Browse as a guest. Sign in to save listings and contact agents
            directly.
          </p>
        </header>

        {isPending ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="space-y-3" key={`listing-skeleton-${index}`}>
                <Skeleton className="h-52 w-full rounded-2xl" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ))}
          </section>
        ) : listings.length ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((item) => (
              <ListingCard
                bathrooms={item.bathrooms}
                bedrooms={item.bedrooms}
                city={item.city}
                id={item.id}
                images={item.images}
                isAuthenticated={isAuthenticated}
                key={item.id}
                listingType={item.listingType}
                price={item.price}
                propertyType={item.propertyType}
                state={item.state}
                title={item.title}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-600">
            <p className="text-lg font-medium text-neutral-800">
              No listings yet
            </p>
            <p className="mt-2 text-sm">
              Listings will appear here once agents publish properties.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
