"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ScanSearch,
  History,
  BookOpen,
  Settings,
  Menu,
  X,
  Shield,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "New Scan", icon: ScanSearch },
  { href: "/history", label: "Scan History", icon: History },
  { href: "/guidelines", label: "Guidelines", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--navy-700)]">
        <Link
          href="/"
          className="flex items-center gap-3 text-white no-underline"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--teal-400)] to-[var(--teal-600)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold leading-tight block">AccessAble</span>
            <p className="text-xs text-[var(--gray-400)] font-medium">
              AI Accessibility Auditor
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* AI Chatbot Trigger */}
        <div className="pt-3">
          <button
            onClick={() => {
              setMobileOpen(false);
              window.dispatchEvent(new CustomEvent("open-ai-chat"));
            }}
            className="w-full nav-link text-[var(--teal-300)] bg-[rgba(20,184,166,0.1)] border border-[rgba(20,184,166,0.25)] hover:bg-[rgba(20,184,166,0.2)] font-medium transition-all group cursor-pointer text-left flex items-center justify-between"
            aria-label="Open AI Assistant Chat"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[var(--teal-400)] flex-shrink-0 group-hover:rotate-12 transition-transform" />
              <span className="text-white font-medium">AI Assistant</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--teal-500)] text-white font-bold">
              Chat
            </span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--navy-700)]">
        <div className="card !p-3 !bg-[var(--navy-800)]">
          <p className="text-xs text-[var(--gray-400)] leading-relaxed">
            Automated checks cannot identify every accessibility barrier. Use
            this tool alongside manual testing.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--navy-800)] border border-[var(--navy-600)] md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-[var(--navy-900)] border-r border-[var(--navy-700)] transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar navigation container"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
