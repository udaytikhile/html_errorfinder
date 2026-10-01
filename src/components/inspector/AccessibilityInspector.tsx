"use client";

import { useState, useMemo } from "react";
import { Info, CheckCircle2 } from "lucide-react";
import InspectorInputBar from "./InspectorInputBar";
import SummaryDashboard from "./SummaryDashboard";
import FilterChips from "./FilterChips";
import PageInfoSidebar from "./PageInfoSidebar";
import SkeletonDashboard from "./SkeletonDashboard";
import EmptyState from "./EmptyState";
import StickyMobileAction from "./StickyMobileAction";
import IssueCard from "@/components/IssueCard";
import { saveToHistory } from "@/lib/history";
import type { ScanResult, Severity, Finding } from "@/lib/types";

interface AccessibilityInspectorProps {
  initialResult?: ScanResult | null;
  initialMode?: "url" | "html";
  initialUrl?: string;
  initialHtml?: string;
}

export default function AccessibilityInspector({
  initialResult = null,
  initialMode,
  initialUrl = "",
  initialHtml = "",
}: AccessibilityInspectorProps) {
  // Mode defaults based on initialResult or explicitly passed mode
  const [mode, setMode] = useState<"url" | "html">(
    initialMode || (initialResult?.source === "url" ? "url" : "html")
  );
  const [urlInput, setUrlInput] = useState(
    initialUrl || (initialResult?.source === "url" && initialResult.url ? initialResult.url : "")
  );
  const [htmlInput, setHtmlInput] = useState(
    initialHtml || (initialResult?.source === "html" ? initialResult.htmlSnippet : "")
  );

  const [result, setResult] = useState<ScanResult | null>(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtering state
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Scan execution
  const handleAnalyze = async () => {
    setError(null);
    setLoading(true);

    try {
      if (mode === "html") {
        if (!htmlInput.trim()) {
          setError("Please paste some HTML code to analyze.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: htmlInput }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "An error occurred during the scan.");
          setLoading(false);
          return;
        }

        const scanRes: ScanResult = data;
        saveToHistory(scanRes);
        setResult(scanRes);
        setSeverityFilter("all");
        setSearchQuery("");

        // Update URL to bookmarkable history route without full reload
        window.history.replaceState(null, "", `/results/${scanRes.id}`);
      } else {
        if (!urlInput.trim()) {
          setError("Please enter a website URL to scan.");
          setLoading(false);
          return;
        }

        let formattedUrl = urlInput.trim();
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
          formattedUrl = `https://${formattedUrl}`;
          setUrlInput(formattedUrl);
        }

        const res = await fetch("/api/scan-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formattedUrl }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(
            data.error ||
              "An error occurred while fetching the URL. Check if the URL is publicly reachable."
          );
          setLoading(false);
          return;
        }

        const scanRes: ScanResult = data;
        saveToHistory(scanRes);
        setResult(scanRes);
        setSeverityFilter("all");
        setSearchQuery("");

        // Update URL to bookmarkable history route without full reload
        window.history.replaceState(null, "", `/results/${scanRes.id}`);
      }
    } catch {
      setError(
        "A network error occurred. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter findings based on active severity chip and search query
  const filteredFindings = useMemo(() => {
    if (!result) return [];

    return result.findings.filter((finding) => {
      const matchesSeverity =
        severityFilter === "all" || finding.severity === severityFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        finding.title.toLowerCase().includes(q) ||
        finding.ruleId.toLowerCase().includes(q) ||
        finding.explanation.toLowerCase().includes(q) ||
        finding.element.toLowerCase().includes(q) ||
        finding.fix.toLowerCase().includes(q);

      return matchesSeverity && matchesSearch;
    });
  }, [result, severityFilter, searchQuery]);

  const counts = useMemo(() => {
    if (!result) {
      return { all: 0, critical: 0, serious: 0, moderate: 0, minor: 0 };
    }
    return {
      all: result.findings.length,
      critical: result.severityBreakdown.critical,
      serious: result.severityBreakdown.serious,
      moderate: result.severityBreakdown.moderate,
      minor: result.severityBreakdown.minor,
    };
  }, [result]);

  const handleScrollToTop = () => {
    const el = document.getElementById("inspector-input-bar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[85vh]">
      {/* ZONE 1: Compact Input Bar Pinned at the Top */}
      <InspectorInputBar
        mode={mode}
        onModeChange={setMode}
        urlInput={urlInput}
        onUrlChange={setUrlInput}
        htmlInput={htmlInput}
        onHtmlChange={setHtmlInput}
        onAnalyze={handleAnalyze}
        loading={loading}
        error={error}
        onClearError={() => setError(null)}
      />

      {/* ZONE 2: Results Area Below (Expands once analysis runs) */}
      {loading ? (
        // State 1: Skeleton Dashboard during loading
        <div className="pt-2">
          <SkeletonDashboard />
        </div>
      ) : !result ? (
        // State 2: Empty/First-load state
        <EmptyState
          onLoadSample={() => {
            setMode("html");
            const sample = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Accessibility Demo Page</title>
</head>
<body>
  <h3>Welcome to Our Web Store</h3>
  <img src="/banner.jpg">
  <button></button>
  <a href="/cart"><svg><circle cx="12" cy="12" r="10"/></svg></a>
  <input type="text" placeholder="Search products...">
  <div id="duplicate-id">Item 1</div>
  <div id="duplicate-id">Item 2</div>
  <p><a href="/policy">click here</a> to read more.</p>
</body>
</html>`;
            setHtmlInput(sample);
            handleScrollToTop();
          }}
          onSetUrl={(sampleUrl) => {
            setMode("url");
            setUrlInput(sampleUrl);
            handleScrollToTop();
          }}
        />
      ) : (
        // State 3: Active Results Layout
        <div className="space-y-6 pt-1">
          {/* Summary Dashboard (Full-width, top of results) */}
          <SummaryDashboard
            breakdown={result.severityBreakdown}
            totalFindings={result.findings.length}
            activeFilter={severityFilter}
            onSelectFilter={setSeverityFilter}
          />

          {/* Filter Chips + Search Row */}
          <FilterChips
            activeSeverity={severityFilter}
            onChangeSeverity={setSeverityFilter}
            searchQuery={searchQuery}
            onChangeSearch={setSearchQuery}
            counts={counts}
          />

          {/* Main Results Layout: 70% Issue List (left) + 30% Sticky Page Info Sidebar (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
            {/* Left Column (~70% desktop, 100% mobile): Issue List */}
            <div className="lg:col-span-7 space-y-4">
              {/* Results status bar */}
              <div className="flex items-center justify-between text-xs text-[var(--gray-400)] px-1">
                <span>
                  Showing <strong className="text-white">{filteredFindings.length}</strong> of{" "}
                  {result.findings.length} issues
                  {severityFilter !== "all" && (
                    <span className="capitalize text-[var(--teal-400)] ml-1">
                      ({severityFilter} only)
                    </span>
                  )}
                  {searchQuery && (
                    <span className="text-[var(--gray-400)] ml-1">
                      matching &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </span>

                {severityFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSeverityFilter("all")}
                    className="text-xs text-[var(--teal-400)] hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {/* Success state: 0 issues in scan */}
              {result.findings.length === 0 && (
                <div className="card text-center py-12 border-emerald-900/40 bg-emerald-950/10">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">
                    No accessibility issues detected!
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--gray-300)] max-w-md mx-auto leading-relaxed">
                    Our automated AST checks passed with zero violations. Automated
                    testing catches up to 40-50% of WCAG criteria; manual screen reader
                    and keyboard testing is still encouraged.
                  </p>
                </div>
              )}

              {/* No match for current filter/search */}
              {result.findings.length > 0 && filteredFindings.length === 0 && (
                <div className="card text-center py-12 border-[var(--navy-700)]">
                  <Info className="w-12 h-12 text-[var(--navy-600)] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">
                    No issues match your current filters
                  </p>
                  <p className="text-xs text-[var(--gray-400)] mt-1">
                    Try changing your severity filter or clearing your search term.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSeverityFilter("all");
                      setSearchQuery("");
                    }}
                    className="btn-secondary text-xs mt-4"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Issue Cards */}
              <div className="space-y-3.5">
                {filteredFindings.map((finding: Finding, idx: number) => (
                  <IssueCard
                    key={`${finding.ruleId}-${idx}`}
                    finding={finding}
                    index={idx}
                  />
                ))}
              </div>
            </div>

            {/* Right Column (~30% desktop, stacks on mobile): Sticky Page Info Sidebar */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 self-start space-y-4">
              <PageInfoSidebar result={result} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Button: Analyze Again / Back to Top */}
      <StickyMobileAction
        onScrollToTop={handleScrollToTop}
        show={!!result && !loading}
      />
    </div>
  );
}
