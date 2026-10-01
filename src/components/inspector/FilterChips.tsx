"use client";

import { Search, X } from "lucide-react";
import type { Severity } from "@/lib/types";

interface FilterChipsProps {
  activeSeverity: Severity | "all";
  onChangeSeverity: (severity: Severity | "all") => void;
  searchQuery: string;
  onChangeSearch: (query: string) => void;
  counts: {
    all: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

export default function FilterChips({
  activeSeverity,
  onChangeSeverity,
  searchQuery,
  onChangeSearch,
  counts,
}: FilterChipsProps) {
  const chips: Array<{
    id: Severity | "all";
    label: string;
    count: number;
    activeClasses: string;
    inactiveClasses: string;
  }> = [
    {
      id: "all",
      label: "All",
      count: counts.all,
      activeClasses: "bg-slate-100 text-slate-900 font-bold shadow-sm",
      inactiveClasses:
        "bg-[var(--navy-900)] text-[var(--gray-300)] border border-[var(--navy-700)] hover:border-slate-500 hover:text-white",
    },
    {
      id: "critical",
      label: "Critical",
      count: counts.critical,
      activeClasses: "bg-red-500 text-white font-bold shadow-sm shadow-red-500/30",
      inactiveClasses:
        "bg-[var(--navy-900)] text-red-400 border border-red-900/50 hover:border-red-500/60 hover:bg-red-950/20",
    },
    {
      id: "serious",
      label: "Serious",
      count: counts.serious,
      activeClasses:
        "bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/30",
      inactiveClasses:
        "bg-[var(--navy-900)] text-orange-400 border border-orange-900/50 hover:border-orange-500/60 hover:bg-orange-950/20",
    },
    {
      id: "moderate",
      label: "Moderate",
      count: counts.moderate,
      activeClasses:
        "bg-yellow-400 text-navy-950 font-bold shadow-sm shadow-yellow-400/30",
      inactiveClasses:
        "bg-[var(--navy-900)] text-yellow-400 border border-yellow-900/50 hover:border-yellow-500/60 hover:bg-yellow-950/20",
    },
    {
      id: "minor",
      label: "Minor",
      count: counts.minor,
      activeClasses:
        "bg-slate-400 text-navy-950 font-bold shadow-sm shadow-slate-400/30",
      inactiveClasses:
        "bg-[var(--navy-900)] text-slate-400 border border-slate-700/70 hover:border-slate-400/60 hover:bg-slate-800/30",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
      {/* Horizontal Filter Chips (scrollable on mobile) */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 -mx-1 px-1"
        role="group"
        aria-label="Filter findings by severity"
      >
        {chips.map((chip) => {
          const isActive = activeSeverity === chip.id;

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onChangeSeverity(chip.id)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive ? chip.activeClasses : chip.inactiveClasses
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? chip.id === "all" || chip.id === "moderate" || chip.id === "minor"
                      ? "bg-black/15 text-navy-950"
                      : "bg-white/20 text-white"
                    : "bg-[var(--navy-800)] text-[var(--gray-400)]"
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Search */}
      <div className="relative w-full md:w-64 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--gray-500)] pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onChangeSearch(e.target.value)}
          placeholder="Filter by rule, code, or fix..."
          aria-label="Filter findings by text"
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--navy-900)] border border-[var(--navy-700)] rounded-lg text-white placeholder:text-[var(--gray-500)] focus:outline-none focus:border-[var(--teal-500)] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onChangeSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--gray-500)] hover:text-white bg-transparent border-none p-0 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
