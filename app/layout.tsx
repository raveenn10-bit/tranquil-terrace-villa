import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tranquil Terrace Galle",
  description: "Private villa reservations and management.",
  icons: {
    icon: "/assets/tranquil-terrace-mark.png",
    shortcut: "/assets/tranquil-terrace-mark.png",
  },
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
