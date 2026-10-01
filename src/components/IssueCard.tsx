"use client";

import { useState } from "react";
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Code2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import type { Finding } from "@/lib/types";

interface IssueCardProps {
  finding: Finding;
  index: number;
}

export default function IssueCard({ finding, index }: IssueCardProps) {
  // Collapse long snippets by default if longer than 3 lines or 140 chars
  const isSnippetLong =
    finding.element.length > 140 || finding.element.split("\n").length > 3;
  const [showFullSnippet, setShowFullSnippet] = useState(false);

  // Gemini AI state
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResult, setGeminiResult] = useState<{
    explanation: string;
    fixExample: string;
  } | null>(
    finding.geminiExplanation
      ? {
          explanation: finding.geminiExplanation,
          fixExample: finding.geminiFixExample || "",
        }
      : null
  );
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const handleGeminiExplain = async () => {
    setShowAiPanel(true);
    if (geminiResult) return;

    setGeminiLoading(true);
    setGeminiError(null);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finding }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGeminiError(data.error || "Failed to get AI explanation.");
      } else {
        setGeminiResult(data);
      }
    } catch {
      setGeminiError("Network error. Please try again.");
    } finally {
      setGeminiLoading(false);
    }
  };

  return (
    <article
      className="card animate-fade-in transition-all duration-200 hover:border-[var(--navy-600)]"
      style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}
      aria-labelledby={`issue-title-${index}`}
    >
      {/* 1. Header: Severity badge (pill) + Rule name title for 1-glance scanning */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2.5 pb-2.5 border-b border-[var(--navy-800)]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <SeverityBadge severity={finding.severity} />
          <h3
            id={`issue-title-${index}`}
            className="text-sm sm:text-base font-semibold text-white tracking-tight leading-snug"
          >
            {finding.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-[var(--gray-400)] bg-[var(--navy-950)] px-2 py-0.5 rounded border border-[var(--navy-700)]">
            {finding.ruleId}
          </span>
          {finding.confidence === "potential" && (
            <span className="text-[10px] text-amber-300/80 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded font-medium">
              potential
            </span>
          )}
        </div>
      </div>

      {/* 2. Body: Plain-English explanation */}
      <p className="text-xs sm:text-sm text-[var(--gray-300)] leading-relaxed mt-3">
        {finding.explanation}
      </p>

      {/* 3. Affected Element Code Snippet (Monospace, subtle background, collapsible when long) */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--gray-400)]">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[var(--gray-500)]" />
            Affected Element
          </span>
          {isSnippetLong && (
            <button
              type="button"
              onClick={() => setShowFullSnippet(!showFullSnippet)}
              className="text-[11px] text-[var(--teal-400)] hover:text-[var(--teal-300)] transition-colors flex items-center gap-1 font-sans cursor-pointer bg-transparent border-none p-0"
              aria-label={
                showFullSnippet
                  ? "Collapse code snippet"
                  : "Show full code snippet"
              }
            >
              {showFullSnippet ? (
                <>
                  Show less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        <div
          className={`relative rounded-lg bg-[var(--navy-950)] border border-[var(--navy-800)] p-3 font-mono text-xs text-red-300/90 leading-relaxed overflow-x-auto ${
            !showFullSnippet && isSnippetLong
              ? "max-h-[5.5rem] overflow-hidden"
              : ""
          }`}
        >
          <pre className="margin-0 whitespace-pre-wrap break-all font-mono">
            <code>{finding.element}</code>
          </pre>
          {!showFullSnippet && isSnippetLong && (
            <div
              className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--navy-950)] via-[var(--navy-950)]/80 to-transparent pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* 4. Suggested Fix (Visually separated with light green-tinted box & left accent bar) */}
      <div className="mt-3.5 p-3 sm:p-3.5 rounded-lg bg-emerald-950/20 border-l-4 border-emerald-500 border border-emerald-900/30">
        <div className="flex items-center gap-1.5 mb-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold text-emerald-300 text-xs uppercase tracking-wider">
            Suggested Fix
          </span>
        </div>
        <div className="text-xs sm:text-sm text-[var(--gray-200)] font-mono leading-relaxed whitespace-pre-wrap break-all">
          {finding.fix}
        </div>
      </div>

      {/* 5. Footer: WCAG reference as a small tag/link at the bottom corner + AI Explanation button */}
      <div className="mt-4 pt-3 border-t border-[var(--navy-800)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          {finding.wcagCriterion ? (
            <a
              href={`https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=1#${finding.wcagCriterion.replace(/\./g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-[var(--gray-400)] hover:text-[var(--teal-300)] bg-[var(--navy-800)] hover:bg-[var(--navy-700)] px-2.5 py-1 rounded-md border border-[var(--navy-700)] transition-colors no-underline"
              title={`View W3C WCAG Criterion ${finding.wcagCriterion}`}
            >
              <ExternalLink className="w-3 h-3 text-[var(--teal-400)]" />
              <span>WCAG {finding.wcagCriterion}</span>
            </a>
          ) : (
            <span className="text-[11px] text-[var(--gray-500)] italic">
              Accessibility Best Practice
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleGeminiExplain}
          disabled={geminiLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-[var(--teal-300)] bg-[rgba(20,184,166,0.1)] hover:bg-[rgba(20,184,166,0.2)] border border-[rgba(20,184,166,0.25)] transition-all cursor-pointer"
          aria-expanded={showAiPanel}
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--teal-400)]" />
          {geminiLoading
            ? "Analyzing..."
            : geminiResult
              ? showAiPanel
                ? "Hide AI Details"
                : "View AI Details"
              : "Explain with AI"}
        </button>
      </div>

      {/* 6. AI Explanation Details Accordion */}
      {showAiPanel && (
        <div className="mt-3.5 pt-3.5 border-t border-[rgba(20,184,166,0.2)] animate-fade-in">
          {geminiLoading && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--navy-800)] text-xs text-[var(--gray-300)]">
              <span className="spinner" />
              <span>Generating tailored AI remediation & explanations...</span>
            </div>
          )}

          {geminiError && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-xs text-red-400 flex items-center justify-between">
              <span>{geminiError}</span>
              <button
                type="button"
                onClick={handleGeminiExplain}
                className="btn-secondary !p-1 text-[11px]"
              >
                Retry
              </button>
            </div>
          )}

          {geminiResult && (
            <div className="p-3.5 rounded-lg bg-[var(--navy-950)] border border-[rgba(20,184,166,0.25)] space-y-2.5 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--teal-400)] font-semibold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                AI Remediation & Impact
              </div>
              <p className="text-[var(--gray-200)] leading-relaxed whitespace-pre-wrap">
                {geminiResult.explanation}
              </p>
              {geminiResult.fixExample && (
                <div>
                  <span className="block text-[11px] font-semibold text-[var(--gray-400)] mb-1">
                    Corrected Code Example:
                  </span>
                  <pre className="p-2.5 rounded bg-[var(--navy-900)] border border-[var(--navy-700)] text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                    <code>{geminiResult.fixExample}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
