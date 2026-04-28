import type { Metadata } from "next";
import "@/globals.css";
import { Providers } from "@/provider";
import { Toaster } from "@/components/ui/sonner";
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
   variable: "--font-mono"
   });

export const metadata: Metadata = {
  title: "GitLoud",
  description:
    "Generate summaries, feature notes, and share-ready posts from GitHub pull requests instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={` ${geistMono.variable}`}>
        {/* <body className={`${geistSans.variable} ${geistMono.variable}`}> */}
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
