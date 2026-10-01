import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import AIChatbot from "@/components/AIChatbot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AccessAble AI — Accessibility Auditor",
  description:
    "AI-powered accessibility auditing tool that helps developers identify, understand, and fix WCAG accessibility issues in web pages.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-[var(--teal-500)] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm"
        >
          Skip to main content
        </a>
        <Sidebar />
        <main id="main-content" tabIndex={-1} className="flex-1 md:ml-64 min-h-screen outline-none">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
        <AIChatbot />
      </body>
    </html>
  );
}
