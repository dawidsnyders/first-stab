import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropInsight | Property Intelligence for South Africa",
  description:
    "Get comprehensive property market analysis reports for any suburb in South Africa. Understand prices, trends, and investment potential.",
  keywords: [
    "property",
    "real estate",
    "South Africa",
    "property prices",
    "market analysis",
    "investment",
    "Cape Town",
    "Western Cape",
  ],
  openGraph: {
    title: "PropInsight | Property Intelligence for South Africa",
    description:
      "Get comprehensive property market analysis reports for any suburb in South Africa.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
