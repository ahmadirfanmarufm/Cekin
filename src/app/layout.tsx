
import type { Metadata, Viewport } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CEKIN - Jangan asal percaya sebelum dicekin",
    template: "%s | CEKIN",
  },
  description: "CEKIN adalah platform edukasi keamanan digital untuk membantu mengenali penipuan online, memeriksa informasi mencurigakan, dan membangun kebiasaan berpikir kritis di dunia digital.",

  applicationName: "CEKIN",

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    title: "CEKIN",
    statusBarStyle: "default",
  },

  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
