import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { AppLayout } from "@/components/app-layout";
import Script from "next/script";
import React from "react";

export const metadata: Metadata = {
  title: { default: "LESGOO GAMBLEE", template: "%s · LESGOO GAMBLEE" },
  description: "by whaleeessss",
};
export const viewport: Viewport = { themeColor: "#0b0b0d" };

const links = [
  { label: "Home", path: "/" },
  { label: "Account", path: "/account" },
  { label: "Bet", path: "/games" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Prevent theme flash – must be in <head> for beforeInteractive */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{
            var t=localStorage.getItem("theme");
            if(t==="light"){document.documentElement.classList.remove("dark");}
            else{document.documentElement.classList.add("dark");}
          }catch(e){document.documentElement.classList.add("dark");}`}
        </Script>
      </head>

      <body className="app-bg min-h-dvh bg-background text-foreground antialiased">
        <AppProviders>
          {/* Let AppLayout own the main container */}
          <AppLayout links={links}>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  );
}
