import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type * as React from "react";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import DocsSidebar from "@/app/docs-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Convex + Better Auth",
  description: "Typesafe, secure auth for Convex apps with Better Auth",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-sidebar`}
      >
        <ThemeProvider enableSystem attribute="class">
          <DocsSidebar>{children}</DocsSidebar>
        </ThemeProvider>
      </body>
    </html>
  );
}
