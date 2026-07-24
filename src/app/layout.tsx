import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { PageTransition } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Providers } from "./providers";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning className={montserrat.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <SmoothScroll />
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
