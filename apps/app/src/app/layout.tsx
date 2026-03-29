import "./styles.css";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import RootProviders from "@/shared/components/root-provider";

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly authModal: React.ReactNode;
};

// Distinctive display font for headlines
const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: "500",
});

export const metadata: Metadata = {
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const RootLayout = ({ children, authModal }: RootLayoutProperties) => (
  <html
    className={`${fonts} ${displayFont.variable}`}
    lang="en"
    suppressHydrationWarning
  >
    <body>
      <RootProviders>
        {authModal}
        {children}
      </RootProviders>
    </body>
  </html>
);

export default RootLayout;
