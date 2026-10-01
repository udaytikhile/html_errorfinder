"use client";

import { useEffect, useState, useId } from "react";
import {
  Globe,
  Code2,
  ScanSearch,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import HtmlCodeEditor from "./HtmlCodeEditor";

interface InspectorInputBarProps {
  mode: "url" | "html";
  onModeChange: (mode: "url" | "html") => void;
  urlInput: string;
  onUrlChange: (url: string) => void;
  htmlInput: string;
  onHtmlChange: (html: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

export default function InspectorInputBar({
  mode,
  onModeChange,
  urlInput,
  onUrlChange,
  htmlInput,
  onHtmlChange,
  onAnalyze,
  loading,
  error,
  onClearError,
}: InspectorInputBarProps) {
  const urlInputId = useId();
  const [urlTouched, setUrlTouched] = useState(false);
  const [inlineUrlError, setInlineUrlError] = useState<string | null>(null);

  // Validate URL inline
  const validateUrl = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "URL cannot be empty.";
    }

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return "URL must begin with https:// or http:// (e.g. https://example.com)";
    }

    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname || !parsed.hostname.includes(".")) {
        return "Please enter a valid domain (e.g. https://example.com)";
      }
      return null;
    } catch {
      return "Malformed URL structure. Please enter a valid web address.";
    }
  };

  const handleUrlChange = (val: string) => {
    onUrlChange(val);
    if (urlTouched || val.length > 5) {
      setUrlTouched(true);
      setInlineUrlError(validateUrl(val));
    } else {
      setInlineUrlError(null);
    }
  };

  const handleUrlBlur = () => {
    setUrlTouched(true);
    if (urlInput.trim()) {
      setInlineUrlError(validateUrl(urlInput));
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to run scan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onAnalyze();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onAnalyze]);

  const isUrlValid = urlInput.trim().length > 0 && !inlineUrlError;
  const isHtmlValid = htmlInput.trim().length > 0;
  const isAnalyzeDisabled =
    loading || (mode === "url" ? !isUrlValid : !isHtmlValid);

  return (
    <section
      id="inspector-input-bar"
      aria-label="Accessibility inspector control bar"
      className="sticky top-0 z-30 bg-[var(--navy-950)]/95 backdrop-blur-md pt-2 pb-4 -mx-6 md:-mx-8 px-6 md:px-8 border-b border-[var(--navy-800)]/90 shadow-lg shadow-black/20 transition-all"
    >
      <div className="space-y-3 max-w-7xl mx-auto">
        {/* Error Banner: Persistent card above input with red left border */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start justify-between gap-3 p-3.5 rounded-xl border-y border-r border-red-900/50 border-l-4 border-l-red-500 bg-red-950/40 animate-fade-in shadow-sm"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-300 uppercase tracking-wider">
                  Audit Scan Error
                </p>
                <p className="text-xs text-red-200/90 mt-0.5 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClearError}
              aria-label="Dismiss error message"
              className="text-red-400 hover:text-white p-1 rounded hover:bg-red-900/40 bg-transparent border-none cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Segmented Control (Mode switch) */}
          <div
            role="radiogroup"
            aria-label="Inspector input mode"
            className="inline-flex p-1 bg-[var(--navy-900)] border border-[var(--navy-700)] rounded-xl self-start md:self-auto flex-shrink-0"
          >
            <button
              type="button"
              role="radio"
              aria-checked={mode === "url"}
              onClick={() => {
                onModeChange("url");
                onClearError();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none ${
                mode === "url"
                  ? "bg-[var(--navy-700)] text-white shadow-sm"
                  : "bg-transparent text-[var(--gray-400)] hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[var(--teal-400)]" />
              <span>Website URL</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={mode === "html"}
              onClick={() => {
                onModeChange("html");
                onClearError();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none ${
                mode === "html"
                  ? "bg-[var(--navy-700)] text-white shadow-sm"
                  : "bg-transparent text-[var(--gray-400)] hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-[var(--teal-400)]" />
              <span>Paste HTML</span>
            </button>
          </div>

          {/* URL Mode: Compact inline input + Analyze button */}
          {mode === "url" && (
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-500)] pointer-events-none" />
                <input
                  id={urlInputId}
                  type="url"
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onBlur={handleUrlBlur}
                  placeholder="https://example.com"
                  disabled={loading}
                  aria-invalid={!!inlineUrlError}
                  aria-describedby={
                    inlineUrlError ? "url-inline-error" : undefined
                  }
                  className={`w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-[var(--navy-900)] text-white transition-all outline-none ${
                    inlineUrlError
                      ? "border-2 border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : urlInput && !inlineUrlError
                        ? "border border-teal-500/60 focus:border-[var(--teal-400)] focus:ring-2 focus:ring-[rgba(20,184,166,0.2)]"
                        : "border border-[var(--navy-700)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[rgba(20,184,166,0.2)]"
                  }`}
                />
                {urlInput && !inlineUrlError && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                )}
              </div>

              {/* Analyze Button */}
              <button
                type="button"
                onClick={onAnalyze}
                disabled={isAnalyzeDisabled}
                className="btn-primary !py-2 !px-5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 flex-shrink-0"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <ScanSearch className="w-4 h-4" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* HTML Mode: Action button in top bar */}
          {mode === "html" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAnalyze}
                disabled={isAnalyzeDisabled}
                className="btn-primary !py-2 !px-5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 flex-shrink-0"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <ScanSearch className="w-4 h-4" />
                    <span>Analyze HTML</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Inline URL Error Message */}
        {mode === "url" && inlineUrlError && (
          <div
            id="url-inline-error"
            role="status"
            className="flex items-center gap-1.5 text-xs text-red-400 font-medium px-1 animate-fade-in"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{inlineUrlError}</span>
          </div>
        )}

        {/* HTML Mode: Lightweight Code Editor with Line Numbers */}
        {mode === "html" && (
          <div className="pt-1 animate-fade-in">
            <HtmlCodeEditor
              value={htmlInput}
              onChange={onHtmlChange}
              disabled={loading}
              placeholder={`<!-- Paste HTML code snippet or full document to inspect -->
<!DOCTYPE html>
<html lang="en">
<head>
  <title>My Web Page</title>
</head>
<body>
  <h1>Page Title</h1>
  <img src="photo.jpg">
  <button></button>
</body>
</html>`}
            />
          </div>
        )}
      </div>
    </section>
  );
}
