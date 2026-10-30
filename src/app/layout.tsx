import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PageTransition } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BookingClickTracker } from "@/components/BookingClickTracker";
import { Providers } from "./providers";
import { BrewBird } from "@/components/BrewBird";
import { REDUCED_MOTION_HTML_CLASS } from "@/lib/motion-policy";
import "./globals.css";

export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
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
          <BrewBird />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
