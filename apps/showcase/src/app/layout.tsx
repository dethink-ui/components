import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import { ShowcaseProviders } from "@/components/showcase-providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const fontBody = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fontHeading = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://components.dethink.co.uk"),
  title: {
    default: "Dethink Components — open-code React components",
    template: "%s · Dethink Components",
  },
  description:
    "Token-themed, accessible, open-code React components for production dashboards, internal tools, and AI-native applications.",
  openGraph: {
    type: "website",
    siteName: "Dethink Components",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
  },
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
          <a
            href="#main-content"
            className="bg-background text-foreground focus-visible:ring-ring sr-only z-50 rounded-md p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex flex-1 flex-col"
          >
            {children}
          </main>
          <SiteFooter />
        </ShowcaseProviders>
      </body>
    </html>
  );
}
