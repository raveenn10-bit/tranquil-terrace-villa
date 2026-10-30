import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tranquilterracegalle.com"),
  title: "Tranquil Terrace Villa Galle | Luxury Private Pool Villas in Karapitiya",
  description:
    "Tranquil Terrace Villa in Karapitiya, Galle — luxury private pool villas for couples. Villa Araliya & Villa Olu feature king suites, private plunge pools & 5-star service.",
  keywords: [
    "Tranquil Terrace Villa",
    "Tranquil Terrace Galle",
    "Tranquil Terrace",
    "Villa in Karapitiya",
    "Private pool villa in Galle",
    "Karapitiya villa",
    "Luxury villa Galle",
    "Sri Lanka private pool villa",
    "Villa Araliya",
    "Villa Olu",
    "Couples villa Galle",
  ],
  authors: [{ name: "Tranquil Terrace Villa" }],
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
    title: "Tranquil Terrace Villa Galle | Luxury Private Pool Villas in Karapitiya",
    description:
      "Tranquil Terrace Villa in Karapitiya, Galle — luxury private pool villas for couples. Villa Araliya & Villa Olu feature king suites, private plunge pools & 5-star service.",
    url: "https://www.tranquilterracegalle.com/",
    siteName: "Tranquil Terrace Villa",
    images: [
      {
        url: "https://www.tranquilterracegalle.com/assets/villa-0.webp",
        width: 1200,
        height: 800,
        alt: "Tranquil Terrace Villa Galle",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tranquil Terrace Villa Galle | Luxury Private Pool Villas in Karapitiya",
    description:
      "Tranquil Terrace Villa in Karapitiya, Galle — luxury private pool villas for couples. Villa Araliya & Villa Olu feature king suites, private plunge pools & 5-star service.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
