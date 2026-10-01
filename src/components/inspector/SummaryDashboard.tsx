"use client";

import {
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
  Layers,
} from "lucide-react";
import type { Severity, SeverityBreakdown } from "@/lib/types";

interface SummaryDashboardProps {
  breakdown: SeverityBreakdown;
  totalFindings: number;
  activeFilter?: Severity | "all";
  onSelectFilter?: (severity: Severity | "all") => void;
}

export default function SummaryDashboard({
  breakdown,
  totalFindings,
  activeFilter,
  onSelectFilter,
}: SummaryDashboardProps) {
  const cards = [
    {
      id: "critical" as Severity,
      label: "Critical",
      subtitle: "Must resolve first",
      count: breakdown.critical,
      borderColor: "border-l-red-500",
      iconColor: "text-red-400",
      countColor: "text-red-400",
      activeBg: "ring-2 ring-red-500/50 bg-red-950/20",
      icon: AlertCircle,
    },
    {
      id: "serious" as Severity,
      label: "Serious",
      subtitle: "High barrier items",
      count: breakdown.serious,
      borderColor: "border-l-orange-500",
      iconColor: "text-orange-400",
      countColor: "text-orange-400",
      activeBg: "ring-2 ring-orange-500/50 bg-orange-950/20",
      icon: AlertTriangle,
    },
    {
      id: "moderate" as Severity,
      label: "Moderate",
      subtitle: "Usability friction",
      count: breakdown.moderate,
      borderColor: "border-l-yellow-400",
      iconColor: "text-yellow-400",
      countColor: "text-yellow-400",
      activeBg: "ring-2 ring-yellow-400/50 bg-yellow-950/20",
      icon: AlertOctagon,
    },
    {
      id: "minor" as Severity,
      label: "Minor",
      subtitle: "Best practices",
      count: breakdown.minor,
      borderColor: "border-l-slate-400",
      iconColor: "text-slate-400",
      countColor: "text-slate-400",
      activeBg: "ring-2 ring-slate-400/50 bg-slate-900/40",
      icon: Info,
    },
  ];

  return (
    <section aria-label="Accessibility findings summary dashboard" className="w-full">
      {/* Responsive layout: 2x2 grid on mobile for severity + 5th distinct card, 5 columns on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 4 Severity Stat Cards */}
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFilter === card.id;

          return (
            <div
              key={card.id}
              onClick={() => onSelectFilter?.(card.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectFilter?.(card.id);
                }
              }}
              aria-label={`Filter by ${card.label}: ${card.count} issues`}
              className={`relative overflow-hidden rounded-xl border-y border-r border-[var(--navy-700)] border-l-4 ${card.borderColor} bg-[var(--navy-900)] p-4 shadow-sm transition-all duration-200 hover:border-r-[var(--navy-600)] hover:border-y-[var(--navy-600)] hover:shadow-md cursor-pointer ${
                isActive ? card.activeBg : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-[var(--gray-300)] uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.iconColor} flex-shrink-0`} aria-hidden="true" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-extrabold ${card.countColor} tracking-tight`}>
                  {card.count}
                </span>
                <span className="text-[11px] text-[var(--gray-400)] hidden sm:inline">
                  {card.count === 1 ? "issue" : "issues"}
                </span>
              </div>

              <p className="text-[11px] text-[var(--gray-500)] mt-1 truncate">
                {card.subtitle}
              </p>
            </div>
          );
        })}

        {/* 5th Total Issues Card: Visually distinct (dark/neutral) so it doesn't compete with severity colors */}
        <div
          onClick={() => onSelectFilter?.("all")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectFilter?.("all");
            }
          }}
          aria-label={`Show all ${totalFindings} issues`}
          className={`col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl border-y border-r border-slate-700/60 border-l-4 border-l-slate-500 bg-[var(--navy-850)]/90 p-4 shadow-sm transition-all duration-200 hover:border-slate-600 hover:shadow-md cursor-pointer ${
            activeFilter === "all"
              ? "ring-2 ring-slate-400/50 bg-slate-800/40"
              : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Total Issues
            </span>
            <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {totalFindings}
            </span>
            <span className="text-[11px] text-slate-400">
              detected
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Across all WCAG criteria
          </p>
        </div>
      </div>
    </section>
  );
}
