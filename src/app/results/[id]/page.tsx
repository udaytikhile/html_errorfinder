"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import AccessibilityInspector from "@/components/inspector/AccessibilityInspector";
import SkeletonDashboard from "@/components/inspector/SkeletonDashboard";
import { getHistoryEntry } from "@/lib/history";
import type { ScanResult } from "@/lib/types";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [result, setResult] = useState<ScanResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const entry = getHistoryEntry(id);
      if (entry) {
        setResult(entry.result);
      }
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [id]);

  if (!loaded) {
    return (
      <div className="space-y-6 pt-4">
        <SkeletonDashboard />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card text-center py-20 max-w-xl mx-auto my-12 animate-fade-in border-[var(--navy-700)]">
        <AlertTriangle className="w-16 h-16 text-[var(--navy-600)] mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">
          Scan result not found
        </h1>
        <p className="text-sm text-[var(--gray-400)] mb-6">
          This scan could not be located in your browser history or was deleted.
        </p>
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2"
          onClick={() => router.push("/scan")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Accessibility Inspector</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AccessibilityInspector
        initialResult={result}
        initialMode={result.source}
        initialUrl={result.source === "url" ? result.url || "" : ""}
        initialHtml={result.source === "html" ? result.htmlSnippet || "" : ""}
      />
    </div>
  );
}
