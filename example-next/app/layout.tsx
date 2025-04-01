import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-50">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
