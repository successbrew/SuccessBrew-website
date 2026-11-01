import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { PageTransition } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BookingClickTracker } from "@/components/BookingClickTracker";
import { Providers } from "./providers";
import { REDUCED_MOTION_HTML_CLASS } from "@/lib/motion-policy";
import "./globals.css";

export const dynamic = "force-dynamic";

// Montserrat is bundled (SIL OFL, see ./fonts/Montserrat-OFL.txt) rather than
// fetched from Google Fonts at build time: when that download fails, next/font
// silently swaps in a fallback font and the whole site renders in the wrong face.
const montserrat = localFont({
  src: "./fonts/montserrat-latin-wght-normal.woff2",
  variable: "--font-montserrat",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Successbrew - Where Brands, Creators, and Founders Scale Together    successbrew.in",
  description: "Content, community, and visibility for ambitious brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${REDUCED_MOTION_HTML_CLASS}`.trim()}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <SmoothScroll />
          <BookingClickTracker />
          <PageTransition>{children}</PageTransition>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
