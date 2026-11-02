import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToasterProvider } from "@/components/providers/ToasterProvider";
import { siteConfig } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - AI-Powered Opportunity Matcher`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "campus placements",
    "internship matcher",
    "AI career assistant",
    "underserved student opportunities",
    "explainable AI recommendations",
  ],
  authors: [{ name: "CareerBridge AI Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
        <ToasterProvider />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

