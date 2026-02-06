import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promotional Carousel",
  description: "Dark-mode SaaS promotional carousel with What's New modal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-bg-base text-text-primary">
        {children}
      </body>
    </html>
  );
}
