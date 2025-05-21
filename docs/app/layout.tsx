import type { Metadata } from "next";
import type * as React from "react";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import DocsSidebar from "@/app/docs-sidebar";

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
      <body className="bg-sidebar">
        <ThemeProvider enableSystem attribute="class">
          <DocsSidebar>{children}</DocsSidebar>
        </ThemeProvider>
      </body>
    </html>
  );
}
