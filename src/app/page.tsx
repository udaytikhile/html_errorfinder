"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ScanSearch,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import { getHistoryStats } from "@/lib/history";
import type { ScanHistoryEntry } from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalScans: 0,
    totalIssues: 0,
    criticalIssues: 0,
    seriousIssues: 0,
    moderateIssues: 0,
    minorIssues: 0,
    recentScans: [] as ScanHistoryEntry[],
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(getHistoryStats());
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const averageScore =
    stats.recentScans.length > 0
      ? Math.round(
          stats.recentScans.reduce((sum, s) => sum + s.score, 0) /
            stats.recentScans.length
        )
      : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[var(--gray-400)] mt-1">
            Overview of your accessibility scans
          </p>
        </div>
        <Link href="/scan" className="btn-primary no-underline">
          <ScanSearch className="w-5 h-5" />
          Start New Scan
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(20,184,166,0.1)] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[var(--teal-400)]" />
            </div>
            <span className="text-xs text-[var(--gray-400)] font-medium uppercase tracking-wider">
              Total Scans
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {loaded ? stats.totalScans : "—"}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(249,115,22,0.1)] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[var(--orange-400)]" />
            </div>
            <span className="text-xs text-[var(--gray-400)] font-medium uppercase tracking-wider">
              Total Issues
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {loaded ? stats.totalIssues : "—"}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(239,68,68,0.1)] flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[var(--red-400)]" />
            </div>
            <span className="text-xs text-[var(--gray-400)] font-medium uppercase tracking-wider">
              Critical Issues
            </span>
          </div>
          <p className="text-3xl font-bold text-[var(--red-400)]">
            {loaded ? stats.criticalIssues : "—"}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(249,115,22,0.1)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--orange-400)]" />
            </div>
            <span className="text-xs text-[var(--gray-400)] font-medium uppercase tracking-wider">
              Serious Issues
            </span>
          </div>
          <p className="text-3xl font-bold text-[var(--orange-400)]">
            {loaded ? stats.seriousIssues : "—"}
          </p>
        </div>
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Score */}
        <div className="card flex flex-col items-center justify-center py-8">
          <h2 className="text-sm font-semibold text-[var(--gray-300)] uppercase tracking-wider mb-4">
            Average Score
          </h2>
          {stats.totalScans > 0 ? (
            <ScoreGauge score={averageScore} />
          ) : (
            <div className="text-center py-8">
              <p className="text-[var(--gray-500)] text-sm">No scans yet</p>
              <Link
                href="/scan"
                className="text-[var(--teal-400)] text-sm mt-2 inline-block no-underline hover:underline"
              >
                Run your first scan →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Scans */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--gray-300)] uppercase tracking-wider">
              Recent Scans
            </h2>
            {stats.totalScans > 0 && (
              <Link
                href="/history"
                className="text-xs text-[var(--teal-400)] no-underline hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {stats.recentScans.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-[var(--navy-600)] mx-auto mb-3" />
              <p className="text-[var(--gray-500)] text-sm">
                No scans have been performed yet.
              </p>
              <p className="text-[var(--gray-500)] text-xs mt-1">
                Start a scan to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentScans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/results/${scan.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--navy-800)] hover:bg-[var(--navy-700)] transition-colors no-underline group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {scan.source === "url"
                        ? scan.url
                        : "HTML Snippet"}
                    </p>
                    <p className="text-xs text-[var(--gray-400)] mt-1">
                      {new Date(scan.timestamp).toLocaleDateString()} •{" "}
                      {scan.totalFindings} issues found
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`text-lg font-bold ${
                        scan.score >= 70
                          ? "text-[var(--emerald-400)]"
                          : scan.score >= 50
                            ? "text-[var(--yellow-400)]"
                            : "text-[var(--red-400)]"
                      }`}
                    >
                      {scan.score}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--gray-500)] group-hover:text-[var(--teal-400)] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Issue Breakdown */}
      {stats.totalScans > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-[var(--gray-300)] uppercase tracking-wider mb-4">
            Issue Breakdown by Severity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Critical",
                count: stats.criticalIssues,
                color: "var(--red-400)",
                bg: "rgba(239,68,68,0.1)",
                border: "border-l-4 border-l-red-500",
              },
              {
                label: "Serious",
                count: stats.seriousIssues,
                color: "var(--orange-400)",
                bg: "rgba(249,115,22,0.1)",
                border: "border-l-4 border-l-orange-500",
              },
              {
                label: "Moderate",
                count: stats.moderateIssues,
                color: "var(--yellow-400)",
                bg: "rgba(234,179,8,0.1)",
                border: "border-l-4 border-l-yellow-400",
              },
              {
                label: "Minor",
                count: stats.minorIssues,
                color: "var(--slate-400)",
                bg: "rgba(148,163,184,0.1)",
                border: "border-l-4 border-l-slate-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`p-4 rounded-lg text-center ${item.border}`}
                style={{ background: item.bg }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: item.color }}
                >
                  {item.count}
                </p>
                <p className="text-xs text-[var(--gray-400)] mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
