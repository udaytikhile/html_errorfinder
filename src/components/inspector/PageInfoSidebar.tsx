"use client";

import { useState } from "react";
import {
  Globe,
  Code2,
  Clock,
  Layers,
  CheckCircle,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck2,
} from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import { getScoreFormula } from "@/lib/score";
import type { ScanResult } from "@/lib/types";

interface PageInfoSidebarProps {
  result: ScanResult;
}

export default function PageInfoSidebar({ result }: PageInfoSidebarProps) {
  const [showFormula, setShowFormula] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(result.timestamp).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const totalPenalties =
    result.severityBreakdown.critical * 15 +
    result.severityBreakdown.serious * 8 +
    result.severityBreakdown.moderate * 3 +
    result.severityBreakdown.minor * 1;

  const handleExportJson = () => {
    const exportData = {
      ...result,
      exportedAt: new Date().toISOString(),
      disclaimer:
        "This is an estimated accessibility score based on automated static HTML analysis. It does not represent official WCAG certification.",
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accessable-ai-${result.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    const summaryText = `[AccessAble AI Audit Summary]
Target: ${result.source === "url" ? result.url : "HTML Snippet"}
Date: ${formattedDate}
Score: ${result.score}/100
Total Findings: ${result.findings.length}
- Critical: ${result.severityBreakdown.critical}
- Serious: ${result.severityBreakdown.serious}
- Moderate: ${result.severityBreakdown.moderate}
- Minor: ${result.severityBreakdown.minor}
Analyzed: ${result.elementsAnalyzed} elements, ${result.rulesChecked} rules.`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <aside
      className="space-y-4"
      aria-label="Audit details and page info sidebar"
    >
      {/* 1. Target & Timestamp Info Card */}
      <div className="card !p-4 border-[var(--navy-700)] bg-[var(--navy-900)]">
        <div className="flex items-center gap-2 mb-2">
          {result.source === "url" ? (
            <div className="w-7 h-7 rounded-lg bg-[rgba(20,184,166,0.15)] flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-[var(--teal-400)]" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[rgba(20,184,166,0.15)] flex items-center justify-center flex-shrink-0">
              <Code2 className="w-4 h-4 text-[var(--teal-400)]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-400)] block">
              Audited Target
            </span>
            <p
              className="text-xs font-semibold text-white truncate"
              title={result.source === "url" ? result.url : "HTML Code Snippet"}
            >
              {result.source === "url" ? result.url : "HTML Code Snippet"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[var(--gray-400)] pt-2 border-t border-[var(--navy-800)]">
          <Clock className="w-3.5 h-3.5 text-[var(--gray-500)] flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 2. Score Gauge Card */}
      <div className="card !p-4 bg-[var(--navy-900)] flex flex-col items-center">
        <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--gray-400)] mb-2">
          Accessibility Health
        </span>

        <ScoreGauge score={result.score} size={120} />

        <div className="mt-2 text-center w-full">
          {result.score === 100 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--emerald-400)] font-semibold bg-[rgba(16,185,129,0.1)] px-2.5 py-0.5 rounded-full border border-[rgba(16,185,129,0.2)]">
              Perfect (0 Deductions)
            </span>
          ) : result.score === 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--red-400)] font-semibold bg-[rgba(239,68,68,0.15)] px-2.5 py-0.5 rounded-full border border-[rgba(239,68,68,0.3)]">
              Floor Capped (-{totalPenalties} pts)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--orange-400)] font-medium bg-[rgba(249,115,22,0.1)] px-2.5 py-0.5 rounded-full border border-[rgba(249,115,22,0.2)]">
              -{totalPenalties} deduction points
            </span>
          )}

          <button
            type="button"
            className="text-[11px] text-[var(--teal-400)] mt-2.5 flex items-center justify-center gap-1 w-full underline cursor-pointer bg-transparent border-none hover:text-[var(--teal-300)] transition-colors"
            onClick={() => setShowFormula(!showFormula)}
            aria-expanded={showFormula}
          >
            <span>{showFormula ? "Hide score math" : "Why this score?"}</span>
            {showFormula ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {showFormula && (
            <div className="mt-2.5 p-3 rounded-lg bg-[var(--navy-950)] text-[11px] text-[var(--gray-300)] border border-[var(--navy-700)] text-left whitespace-pre-wrap leading-relaxed animate-fade-in font-mono">
              {getScoreFormula()}
            </div>
          )}
        </div>
      </div>

      {/* 3. Scan Diagnostics Card */}
      <div className="card !p-4 bg-[var(--navy-900)] space-y-2.5 text-xs">
        <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--gray-400)] block">
          Scan Diagnostics
        </span>

        <div className="flex items-center justify-between py-1 border-b border-[var(--navy-800)]">
          <span className="text-[var(--gray-400)] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--gray-500)]" />
            Elements Analyzed
          </span>
          <span className="font-mono font-bold text-white">
            {result.elementsAnalyzed}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-[var(--navy-800)]">
          <span className="text-[var(--gray-400)] flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-[var(--gray-500)]" />
            WCAG Rules Checked
          </span>
          <span className="font-mono font-bold text-white">
            {result.rulesChecked}
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-[var(--gray-400)] flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[var(--gray-500)]" />
            Analysis Engine
          </span>
          <span className="text-[11px] text-[var(--teal-400)] font-medium">
            Static AST + AI
          </span>
        </div>
      </div>

      {/* 4. Actions Card */}
      <div className="card !p-3 bg-[var(--navy-900)] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleExportJson}
          className="btn-secondary !py-2 !px-3 text-xs w-full flex items-center justify-center gap-2"
        >
          <Download className="w-3.5 h-3.5 text-[var(--teal-400)]" />
          <span>Export JSON Report</span>
        </button>

        <button
          type="button"
          onClick={handleCopySummary}
          className="btn-secondary !py-2 !px-3 text-xs w-full flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Summary Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[var(--gray-400)]" />
              <span>Copy Summary Text</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
