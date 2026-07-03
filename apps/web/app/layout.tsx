import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Toaster } from "@repo/ui/components/sonner";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";


const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitloud-web.vercel.app/";
const siteName = "GitLoud";
const siteDescription =
  "Generate GitHub pull request and commit summaries, changelog entries, portfolio bullets, and share-ready posts for X, LinkedIn, and Reddit.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    "developer content assistant",
    "changelog generator",
    "portfolio bullet generator",
    "LinkedIn post generator for developers",
    "Twitter post generator for developers",
    "Reddit post generator for developers",
  ],
  authors: [{ name: "GitLoud" }],
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
      className="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${geistMono.variable} relative isolate h-dvh overflow-hidden bg-background`}
        suppressHydrationWarning
      >

        <ClerkProvider>
          <Providers initialTheme="dark">
            <ScrollArea id="app-scroll-area" className="relative z-10 h-dvh">
              {children}
            </ScrollArea>
            <Toaster />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
