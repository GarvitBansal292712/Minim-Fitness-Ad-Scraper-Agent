import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINIM",
  description: "Video production agency dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
