import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tranquilterracegalle.com"),
  title: "Tranquil Terrace Galle | Luxury Private Pool Villas",
  description:
    "Discover Tranquil Terrace Galle, a romantic private pool villa getaway in Karapitiya with couples’ day-out packages, luxury stays and direct booking.",
  keywords: [
    "Tranquil Terrace Villa",
    "Tranquil Terrace Galle",
    "Tranquil Terrace",
    "Luxury Villa Galle",
    "Private Pool Villa Galle",
    "Day Outs for Couples",
    "Couple Day Out Galle",
  ],
  authors: [{ name: "Tranquil Terrace Galle" }],
  alternates: {
    canonical: "https://www.tranquilterracegalle.com/",
    languages: {
      "en-LK": "https://www.tranquilterracegalle.com/",
      "x-default": "https://www.tranquilterracegalle.com/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Tranquil Terrace Galle | Luxury Private Pool Villas",
    description:
      "Discover Tranquil Terrace Galle, a romantic private pool villa getaway in Karapitiya with couples’ day-out packages, luxury stays and direct booking.",
    url: "https://www.tranquilterracegalle.com/",
    siteName: "Tranquil Terrace Galle",
    images: [
      {
        url: "https://www.tranquilterracegalle.com/assets/villa-0.webp",
        width: 1200,
        height: 800,
        alt: "Tranquil Terrace Galle private pool villa",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tranquil Terrace Galle | Luxury Private Pool Villas",
    description:
      "Discover Tranquil Terrace Galle, a romantic private pool villa getaway in Karapitiya with couples’ day-out packages, luxury stays and direct booking.",
    images: ["https://www.tranquilterracegalle.com/assets/villa-0.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-LK">
      <body className="antialiased">{children}</body>
    </html>
  );
}
