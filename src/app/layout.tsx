import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dynamicImageUrl = "/invitation-home.png";

export const metadata: Metadata = {
  title: {
    default: "Invitation Home Rentals - Your Trusted U.S. Real Estate Partner",
    template: "%s | Invitation Home Rentals",
  },
  description:
    "Explore premier properties for sale and rent across the United States. Invitation Home Rentals helps you make smart real estate decisions from coast to coast.",
  keywords: [
    "Invitation Home Rentals",
    "real estate USA",
    "homes for sale",
    "houses in New York",
    "Texas real estate",
    "Florida properties",
    "buy a house in the US",
    "rental homes",
    "property management",
  ],
  authors: [
    {
      name: "Invitation Home Rentals",
      url: "https://invitationhomesrentals.com",
    },
  ],
  creator: "Invitation Home Rentals",
  publisher: "Invitation Home Rentals",
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  metadataBase: new URL("https://invitationhomesrentals.com"),
  openGraph: {
    title: "Invitation Home Rentals - Your Trusted U.S. Real Estate Partner",
    description:
      "Buy, rent, or invest in top properties across the United States. From New York to California, Invitation Home Rentals connects you to your dream home.",
    url: "https://invitationhomesrentals.com",
    siteName: "Invitation Home Rentals",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: dynamicImageUrl,
        width: 1200,
        height: 630,
        alt: "Invitation Home Rentals homepage banner showing homes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invitation Home Rentals - U.S. Real Estate Solutions",
    description:
      "Trusted advisors in U.S. real estate. Find, buy, or rent your next home with Invitation Home Rentals.",
    images: [dynamicImageUrl],
    site: "@InvitationHomeRentals",
  },
  icons: {
    icon: dynamicImageUrl,
    shortcut: dynamicImageUrl,
    apple: dynamicImageUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Invitation Home Rentals",
    url: "https://invitationhomesrentals.com",
    logo: dynamicImageUrl,
    image: dynamicImageUrl,
    description:
      "Premier real estate agency helping clients buy, rent, and invest in properties across the United States.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    sameAs: [
      "https://twitter.com/InvitationHomeRentals",
      // Add other social profiles as needed
    ],
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    serviceArea: {
      "@type": "GeoShape",
      addressCountry: "US",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Invitation Home Rentals",
    url: "https://invitationhomesrentals.com",
    description:
      "Explore premier properties for sale and rent across the United States.",
    publisher: {
      "@type": "RealEstateAgent",
      name: "Invitation Home Rentals",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://invitationhomesrentals.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white",
              color: "black",
              border: "1px solid #e2e8f0",
            },
            className: "sonner-toast",
            duration: 4000,
          }}
          richColors
          expand={false}
          closeButton
        />
        <Analytics />
        <Navbar />
        <main className="pt-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
