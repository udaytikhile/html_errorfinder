"use client";

import { ArrowUp } from "lucide-react";

interface StickyMobileActionProps {
  onScrollToTop: () => void;
  show?: boolean;
}

export default function StickyMobileAction({
  onScrollToTop,
  show = true,
}: StickyMobileActionProps) {
  if (!show) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-40 md:hidden animate-fade-in"
      aria-label="Back to top and analyze again"
    >
      <button
        type="button"
        onClick={onScrollToTop}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--teal-500)] hover:bg-[var(--teal-400)] text-white text-xs font-bold shadow-xl shadow-teal-950/60 border border-teal-300/40 cursor-pointer active:scale-95 transition-transform"
      >
        <ArrowUp className="w-4 h-4" />
        <span>Analyze Again</span>
      </button>
    </div>
  );
}
