"use client";

import { useRef, useState } from "react";
import { Code2, Sparkles, Trash2, Copy, Check } from "lucide-react";

interface HtmlCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SAMPLE_HTML_WITH_ISSUES = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Accessible Demo Store</title>
</head>
<body>
  <!-- Header with skipped heading level -->
  <h3>Welcome to Our Web Store</h3>
  
  <!-- Image missing alt attribute (Critical) -->
  <img src="/images/banner-sale.jpg">
  
  <!-- Icon link with no accessible text label (Serious) -->
  <a href="/cart" class="cart-btn">
    <svg width="24" height="24"><circle cx="12" cy="12" r="10"/></svg>
  </a>

  <!-- Button without text content (Serious) -->
  <button type="button" class="search-btn"></button>

  <!-- Form input missing associated label (Serious) -->
  <div class="newsletter-box">
    <span>Sign up for discounts:</span>
    <input type="email" placeholder="you@domain.com">
    <button type="submit">Subscribe</button>
  </div>

  <!-- Duplicate element IDs on the same page (Moderate) -->
  <section id="promo-banner">Promo 1</section>
  <section id="promo-banner">Promo 2</section>

  <!-- Non-descriptive generic link text (Minor) -->
  <p>Learn more about our shipping policies <a href="/faq">click here</a>.</p>
</body>
</html>`;

export default function HtmlCodeEditor({
  value,
  onChange,
  placeholder = "Paste your HTML snippet or document here...",
  disabled = false,
}: HtmlCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Calculate lines
  const lines = value ? value.split("\n") : [""];
  const lineCount = Math.max(lines.length, 8);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Synchronize gutter scrolling with textarea
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleInsertSample = () => {
    onChange(SAMPLE_HTML_WITH_ISSUES);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleClear = () => {
    onChange("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full rounded-xl border border-[var(--navy-700)] bg-[var(--navy-950)] overflow-hidden shadow-inner focus-within:border-[var(--teal-500)] focus-within:ring-2 focus-within:ring-[rgba(20,184,166,0.2)] transition-all">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[var(--navy-900)] border-b border-[var(--navy-800)] text-xs text-[var(--gray-400)]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[var(--teal-400)]" />
          <span className="font-semibold text-[var(--gray-200)]">
            HTML Source
          </span>
          <span className="text-[11px] font-mono text-[var(--gray-500)] bg-[var(--navy-800)] px-2 py-0.5 rounded">
            {lines.length} {lines.length === 1 ? "line" : "lines"} •{" "}
            {value.length.toLocaleString()} chars
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInsertSample}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[rgba(20,184,166,0.1)] hover:bg-[rgba(20,184,166,0.2)] text-[var(--teal-300)] text-[11px] font-medium border border-[rgba(20,184,166,0.25)] transition-colors cursor-pointer"
            title="Load sample HTML with accessibility issues"
          >
            <Sparkles className="w-3 h-3 text-[var(--teal-400)]" />
            Load Sample HTML
          </button>

          {value && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--navy-800)] hover:bg-[var(--navy-700)] text-[var(--gray-300)] text-[11px] transition-colors cursor-pointer"
                title="Copy code to clipboard"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--navy-800)] hover:bg-red-950/40 hover:text-red-400 text-[var(--gray-400)] text-[11px] transition-colors cursor-pointer"
                title="Clear code"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Body: Line numbers gutter + Monospace textarea */}
      <div className="flex relative min-h-[220px] max-h-[360px] overflow-hidden bg-[var(--navy-950)]">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="select-none overflow-hidden text-right pr-3.5 pl-3 py-3 font-mono text-xs text-[var(--gray-600)] bg-[var(--navy-900)]/60 border-r border-[var(--navy-800)]"
          style={{ width: "3.75rem", minWidth: "3.75rem" }}
        >
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          disabled={disabled}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 w-full p-3 font-mono text-xs leading-6 text-gray-100 bg-transparent border-none outline-none resize-none overflow-y-auto whitespace-pre no-scrollbar placeholder:text-[var(--gray-600)]"
          aria-label="HTML code editor"
        />
      </div>
    </div>
  );
}
