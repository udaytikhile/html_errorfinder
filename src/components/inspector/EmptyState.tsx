"use client";

import { ScanSearch, Sparkles, CheckCircle, ShieldCheck, ArrowUp } from "lucide-react";

interface EmptyStateProps {
  onLoadSample: () => void;
  onSetUrl: (url: string) => void;
}

export default function EmptyState({ onLoadSample, onSetUrl }: EmptyStateProps) {
  return (
    <div className="card !p-8 md:!p-12 text-center bg-[var(--navy-900)] border-[var(--navy-700)] max-w-3xl mx-auto my-6 animate-fade-in">
      {/* Visual illustration / icon */}
      <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[var(--teal-500)]/20 to-[var(--navy-700)]/30 border border-[var(--teal-500)]/30 animate-pulse" />
        <div className="w-16 h-16 rounded-xl bg-[var(--navy-800)] border border-[var(--navy-600)] flex items-center justify-center shadow-lg">
          <ScanSearch className="w-8 h-8 text-[var(--teal-400)]" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(20,184,166,0.1)] border border-[rgba(20,184,166,0.2)] text-[var(--teal-300)] text-xs font-semibold uppercase tracking-wider mb-3">
        <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
        Ready to Inspect
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
        Paste HTML or enter a URL to get started
      </h2>

      <p className="text-sm text-[var(--gray-400)] max-w-lg mx-auto mb-8 leading-relaxed">
        Run automated static accessibility checks against WCAG 2.1 / 2.2 guidelines.
        Identify critical blockers, review element snippets, and get actionable plain-English fixes.
      </p>

      {/* Quick Test Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onLoadSample}
          className="btn-primary !py-2.5 !px-4 text-xs font-semibold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Load Sample with Common Issues</span>
        </button>

        <button
          type="button"
          onClick={() => onSetUrl("https://example.com")}
          className="btn-secondary !py-2.5 !px-4 text-xs font-semibold flex items-center gap-2"
        >
          <span>Use example.com URL</span>
        </button>
      </div>

      {/* Features checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-[var(--navy-800)] text-xs text-[var(--gray-400)]">
        <div className="flex items-center justify-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-[var(--teal-400)] flex-shrink-0" />
          <span>Image Alt & Labels</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-[var(--teal-400)] flex-shrink-0" />
          <span>Form Inputs & Controls</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-[var(--teal-400)] flex-shrink-0" />
          <span>Heading Hierarchy</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--teal-400)] flex-shrink-0" />
          <span>Instant Severity Triage</span>
        </div>
      </div>
    </div>
  );
}
