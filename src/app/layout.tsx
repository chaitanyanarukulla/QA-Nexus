import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QA Nexus - Quality Assurance Management Platform",
  description: "AI-driven QA platform for test management, execution, and defect tracking",
};

import { AIChatWidget } from "@/components/ai/ai-chat-widget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Sidebar />
        <div className="flex flex-col min-h-screen lg:ml-64">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <AIChatWidget />
        <Toaster />
      </body>
    </html>
  );
}
