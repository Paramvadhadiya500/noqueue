import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. Metadata gets the title, description, and manifest
export const metadata: Metadata = {
  title: "SmartOPD",
  description: "Serverless Hospital Queue System",
  manifest: "/manifest.json",
};

// 2. Viewport gets the themeColor
export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}