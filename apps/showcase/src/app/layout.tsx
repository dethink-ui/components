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

/*
 * Applies the stored brand theme before first paint so a hard reload never
 * flashes the default teal brand. Must stay in sync with BRAND_STORAGE_KEY
 * and DEFAULT_BRAND in lib/brand-themes.ts.
 */
const brandInitScript = `try{var b=localStorage.getItem("dethink-brand");if(b&&b!=="teal")document.documentElement.setAttribute("data-brand",b);}catch(e){}`;

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
        className="bg-background text-foreground flex min-h-svh flex-col font-sans antialiased"
      >
        <script dangerouslySetInnerHTML={{ __html: brandInitScript }} />
        <ShowcaseProviders>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </ShowcaseProviders>
      </body>
    </html>
  );
}
