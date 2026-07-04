import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ShowcaseProviders } from "@/components/showcase-providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Dethink Components — open-code React components",
    template: "%s · Dethink Components",
  },
  description:
    "Token-themed, accessible, open-code React components for production dashboards, internal tools, and AI-native applications.",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontBody.variable} ${fontHeading.variable} ${fontMono.variable}`}
    >
      <body
        data-density="default"
        className="flex min-h-svh flex-col bg-background font-sans text-foreground antialiased"
      >
        <ShowcaseProviders>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </ShowcaseProviders>
      </body>
    </html>
  );
}
