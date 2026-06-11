import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sapiensscientia.com"),
  title: "Sapiens Scientia",
  description:
    "A public knowledge project mapping human health, society, Earth systems, and digital knowledge.",
  openGraph: {
    title: "Sapiens Scientia",
    description:
      "A public knowledge project mapping human health, society, Earth systems, and digital knowledge.",
    url: "/",
    siteName: "Sapiens Scientia",
    type: "website",
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
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
