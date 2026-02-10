import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-kamino-sans",
});

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
    <html lang="en" className={`dark ${ibmPlexSans.variable}`}>
      <body className="antialiased bg-bg-base text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
