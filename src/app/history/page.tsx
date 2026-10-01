"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Eye,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  getHistory,
  deleteHistoryEntry,
  clearHistory,
} from "@/lib/history";
import type { ScanHistoryEntry } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory(getHistory());
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scan History</h1>
          <p className="text-sm text-[var(--gray-400)] mt-1">
            Previous accessibility scans stored in your browser
          </p>
        </div>
        {history.length > 0 && (
          <div>
            {showClearConfirm ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xs text-[var(--gray-400)]">
                  Delete all scans?
                </span>
                <button
                  className="btn-danger text-xs"
                  onClick={handleClearAll}
                >
                  Yes, clear all
                </button>
                <button
                  className="btn-secondary text-xs"
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
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="p-3 rounded-lg bg-[var(--navy-800)] border border-[var(--navy-700)] flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-[var(--yellow-400)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--gray-400)]">
          Scan history is stored in your browser&apos;s localStorage. It is not
          synced across devices or backed up. Clearing your browser data will
          delete this history.
        </p>
      </div>

      {/* History list */}
      {!loaded ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-[var(--navy-600)] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">
            No scan history
          </h2>
          <p className="text-sm text-[var(--gray-400)] mb-6">
            Your scan results will appear here after you run your first scan.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push("/scan")}
          >
            Start a New Scan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, idx) => (
            <div
              key={entry.id}
              className="card flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {entry.source === "url"
                      ? entry.url
                      : "HTML Snippet"}
                  </p>
                </div>
                <p className="text-xs text-[var(--gray-400)]">
                  {new Date(entry.timestamp).toLocaleString()} •{" "}
                  {entry.totalFindings} issues
                </p>
                <div className="flex gap-2 mt-2">
                  {entry.severityBreakdown.critical > 0 && (
                    <span className="text-xs text-[var(--red-400)]">
                      {entry.severityBreakdown.critical} critical
                    </span>
                  )}
                  {entry.severityBreakdown.serious > 0 && (
                    <span className="text-xs text-[var(--orange-400)]">
                      {entry.severityBreakdown.serious} serious
                    </span>
                  )}
                  {entry.severityBreakdown.moderate > 0 && (
                    <span className="text-xs text-[var(--yellow-400)]">
                      {entry.severityBreakdown.moderate} moderate
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-2xl font-bold ${
                    entry.score >= 70
                      ? "text-[var(--emerald-400)]"
                      : entry.score >= 50
                        ? "text-[var(--yellow-400)]"
                        : "text-[var(--red-400)]"
                  }`}
                >
                  {entry.score}
                </span>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary !p-2"
                    onClick={() => router.push(`/results/${entry.id}`)}
                    aria-label={`View scan results for ${
                      entry.source === "url" ? entry.url : "HTML snippet"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="btn-secondary !p-2 hover:!border-[rgba(239,68,68,0.3)] hover:!text-[var(--red-400)]"
                    onClick={() => handleDelete(entry.id)}
                    aria-label={`Delete scan for ${
                      entry.source === "url" ? entry.url : "HTML snippet"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
