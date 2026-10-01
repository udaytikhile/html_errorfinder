"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Shield,
  Info,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import { clearHistory, getHistory } from "@/lib/history";

export default function SettingsPage() {
  const [geminiStatus, setGeminiStatus] = useState<
    "checking" | "configured" | "not-configured" | "error"
  >("checking");
  const [historyCount, setHistoryCount] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Check Gemini API status
    fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finding: {
          ruleId: "test",
          title: "Test",
          severity: "minor",
          confidence: "confirmed",
          explanation: "test",
          element: "<div>",
          fix: "test",
        },
      }),
    })
      .then((res) => {
        if (res.status === 503) {
          setGeminiStatus("not-configured");
        } else {
          setGeminiStatus("configured");
        }
      })
      .catch(() => {
        setGeminiStatus("error");
      });

    const timer = setTimeout(() => {
      setHistoryCount(getHistory().length);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleClearHistory = () => {
    clearHistory();
    setHistoryCount(0);
    setShowClearConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[var(--gray-400)] mt-1">
          Configuration and preferences
        </p>
      </div>

      {/* Gemini API */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[rgba(20,184,166,0.1)] flex items-center justify-center">
            <Key className="w-5 h-5 text-[var(--teal-400)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Google Gemini API
            </h2>
            <p className="text-xs text-[var(--gray-400)]">
              AI-powered explanations for accessibility issues
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[var(--navy-800)] border border-[var(--navy-700)] mb-4">
          <div className="flex items-center gap-2 mb-2">
            {geminiStatus === "checking" && (
              <>
                <div className="spinner" />
                <span className="text-sm text-[var(--gray-400)]">
                  Checking API status...
                </span>
              </>
            )}
            {geminiStatus === "configured" && (
              <>
                <CheckCircle2 className="w-5 h-5 text-[var(--emerald-400)]" />
                <span className="text-sm text-[var(--emerald-400)]">
                  Gemini API is configured and ready
                </span>
              </>
            )}
            {geminiStatus === "not-configured" && (
              <>
                <XCircle className="w-5 h-5 text-[var(--yellow-400)]" />
                <span className="text-sm text-[var(--yellow-400)]">
                  Gemini API key not configured
                </span>
              </>
            )}
            {geminiStatus === "error" && (
              <>
                <XCircle className="w-5 h-5 text-[var(--red-400)]" />
                <span className="text-sm text-[var(--red-400)]">
                  Error checking API status
                </span>
              </>
            )}
          </div>
        </div>

        {geminiStatus === "not-configured" && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--gray-300)]">
              To enable AI-powered explanations:
            </p>
            <ol className="space-y-2 text-sm text-[var(--gray-400)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--teal-400)] font-bold">1.</span>
                Get an API key from{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--teal-400)] hover:underline"
                >
                  Google AI Studio
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--teal-400)] font-bold">2.</span>
                Create a{" "}
                <code className="text-xs bg-[var(--navy-700)] px-1.5 py-0.5 rounded">
                  .env.local
                </code>{" "}
                file in your project root
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--teal-400)] font-bold">3.</span>
                Add:{" "}
                <code className="text-xs bg-[var(--navy-700)] px-1.5 py-0.5 rounded">
                  GEMINI_API_KEY=your_api_key_here
                </code>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--teal-400)] font-bold">4.</span>
                Restart the development server
              </li>
            </ol>
          </div>
        )}

        <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-[rgba(20,184,166,0.05)] border border-[rgba(20,184,166,0.1)]">
          <Shield className="w-4 h-4 text-[var(--teal-400)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--gray-400)]">
            Your API key is stored server-side in environment variables and
            never exposed to the browser. The scanner works fully without
            Gemini — AI explanations are an optional enhancement.
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[rgba(20,184,166,0.1)] flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-[var(--teal-400)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Data Management
            </h2>
            <p className="text-xs text-[var(--gray-400)]">
              Manage your locally stored scan data
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--gray-400)] mb-4">
          You have <strong className="text-white">{historyCount}</strong> scan
          {historyCount !== 1 ? "s" : ""} stored in your browser.
        </p>

        {cleared && (
          <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] mb-4 animate-fade-in">
            <p className="text-sm text-[var(--emerald-400)]">
              ✓ All scan history has been cleared.
            </p>
          </div>
        )}

        {historyCount > 0 && (
          <div>
            {showClearConfirm ? (
              <div className="flex items-center gap-3 animate-fade-in">
                <p className="text-sm text-[var(--gray-300)]">
                  Are you sure? This cannot be undone.
                </p>
                <button
                  className="btn-danger text-sm"
                  onClick={handleClearHistory}
                >
                  Yes, delete all
                </button>
                <button
                  className="btn-secondary text-sm"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="btn-danger"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                Clear All Scan History
              </button>
            )}
          </div>
        )}
      </div>

      {/* About */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[rgba(20,184,166,0.1)] flex items-center justify-center">
            <Info className="w-5 h-5 text-[var(--teal-400)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              About AccessAble AI
            </h2>
            <p className="text-xs text-[var(--gray-400)]">Version 1.0.0</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-[var(--gray-400)]">
          <p>
            AccessAble AI is an accessibility auditing tool that helps
            developers identify and fix common accessibility issues in HTML
            content.
          </p>
          <p>
            <strong className="text-[var(--gray-300)]">What it does:</strong>{" "}
            Static HTML analysis checking for 9 categories of accessibility
            rules based on WCAG guidelines.
          </p>
          <p>
            <strong className="text-[var(--gray-300)]">What it doesn&apos;t do:</strong>{" "}
            Runtime behavior testing, color contrast checking, keyboard
            interaction testing, or screen reader compatibility testing. These
            require manual testing or specialized tools.
          </p>
        </div>
      </div>
    </div>
  );
}
