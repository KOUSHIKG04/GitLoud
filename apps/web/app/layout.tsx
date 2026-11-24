import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Toaster } from "@repo/ui/components/sonner";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { siteUrl } from "@/lib/site-url";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const siteName = "GitLoud";
const siteDescription =
  "Generate GitHub pull request and commit summaries, changelog entries, portfolio bullets, and share-ready posts using GitLoud or your own AI API key.";

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  applicationName: siteName,
  title: {
    default: "GitLoud - GitHub PR Summary and Social Post Generator",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "GitLoud",
    "GitHub PR summary generator",
    "pull request summary",
    "commit summary generator",
    "AI changelog generator",
    "release notes generator",
    "portfolio bullet generator",
    "build in public",
    "LinkedIn post generator for developers",
    "X post generator for developers",
    "Reddit post generator for developers",
    "bring your own AI key",
  ],
  authors: [{ name: "GitLoud" }],
  // Google Search Console: set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the
  // content value of the HTML-tag method to verify the site.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  creator: "GitLoud",
  publisher: "GitLoud",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: "GitLoud - Turn GitHub PRs Into Share-Ready Content",
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GitLoud - GitHub PR Summary and Social Post Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitLoud - GitHub PR Summary and Social Post Generator",
    description: siteDescription,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geist.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`font-sans selection:bg-neutral-500/30 relative isolate h-dvh overflow-hidden bg-background`}
        suppressHydrationWarning
      >
        <ClerkProvider>
          <Providers>
            <ScrollArea id="app-scroll-area" className="relative z-10 h-dvh">
              {children}
            </ScrollArea>
            <Toaster theme="dark" />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
