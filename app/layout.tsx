import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Nav } from "@/components/Nav";
import { CommandPalette } from "@/components/CommandPalette";
import { CursorGlow } from "@/components/CursorGlow";
import { Footer } from "@/components/Footer";
import { getProjectSummaries } from "@/lib/content";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.fullName} · ${site.role}`, template: `%s · ${site.fullName}` },
  description: site.tagline,
  openGraph: { title: `${site.fullName} · ${site.role}`, description: site.tagline, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#070a0f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const projects = getProjectSummaries();
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-bg">
          Skip to content
        </a>
        <ChatProvider projects={projects}>
          <CursorGlow />
          <Nav />
          <div id="main" className="overflow-x-clip">
            {children}
            <Footer />
          </div>
          <CommandPalette />
          <ChatWidget />
        </ChatProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
