import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { HomeView } from "@modules/home";

export const metadata: Metadata = createMetadata({
  title: "Join Our Lagos Rental Online Focus Group",
  description:
    "We're researching a better way to rent in Lagos. Sign up to take part in our online focus group to share your experience as a renter, agent, or landlord and help shape a more transparent rental process.",
  openGraph: {
    title: "Converge Online Focus Group",
    description:
      "We're researching a better way to rent in Lagos. Sign up to take part in our online focus group to share your experience.",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Converge Online Focus Group",
    description:
      "We're researching a better way to rent in Lagos. Sign up to take part in our online focus group to share your experience.",
  },
  keywords: [
    "Lagos rentals",
    "rent in Lagos",
    "property rentals Lagos",
    "rental research",
    "landlord Lagos",
    "property agents Lagos",
    "apartment search Lagos",
  ],
});

export default function HomePage() {
  return <HomeView />;
}
