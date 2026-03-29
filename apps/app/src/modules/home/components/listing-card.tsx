import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";

type ListingCardProperties = {
  bathrooms: number | null;
  bedrooms: number | null;
  city: string;
  id: string;
  images: string[];
  isAuthenticated: boolean;
  listingType: string;
  price: number;
  propertyType: string;
  state: string;
  title: string;
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function ListingCard({
  bathrooms,
  bedrooms,
  city,
  id,
  images,
  isAuthenticated,
  listingType,
  price,
  propertyType,
  state,
  title,
}: ListingCardProperties) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";
  const image = images[0] ?? fallbackImage;

  return (
    <article
      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      data-id={id}
    >
      <div className="relative h-52 overflow-hidden bg-neutral-100">
        <img alt={title} className="h-full w-full object-cover" src={image} />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-white text-neutral-900" variant="secondary">
            {listingType.toUpperCase()}
          </Badge>
          <Badge className="bg-teal-700 text-white" variant="secondary">
            {propertyType}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-neutral-900">
          {title}
        </h3>
        <p className="text-sm text-neutral-600">
          {city}, {state}
        </p>
        <p className="text-xl font-semibold text-neutral-900">
          {CURRENCY_FORMATTER.format(price)}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-700">
          {bedrooms !== null ? (
            <Badge variant="outline">{bedrooms} bed</Badge>
          ) : null}
          {bathrooms !== null ? (
            <Badge variant="outline">{bathrooms} bath</Badge>
          ) : null}
        </div>
        {isAuthenticated ? (
          <Button className="w-full" variant="outline">
            Contact agent
          </Button>
        ) : (
          <p className="text-sm text-neutral-600">
            Sign in to contact agent or save listing.
          </p>
        )}
      </div>
    </article>
  );
}
