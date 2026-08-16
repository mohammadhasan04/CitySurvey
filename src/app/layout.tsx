import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "City Population & Household Survey System",
    template: "%s | City Survey System",
  },
  description:
    "A secure digital platform for collecting and managing household and population survey information. View city statistics, ward data, and survey progress.",
  keywords: [
    "city survey",
    "population census",
    "household survey",
    "ward statistics",
    "municipal data",
    "smart city",
  ],
  authors: [{ name: "City Survey Administration" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
