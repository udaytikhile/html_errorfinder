"use client";

export default function SkeletonDashboard() {
  return (
    <div
      className="space-y-6 animate-pulse"
      aria-busy="true"
      aria-label="Analyzing accessibility... previewing results layout"
    >
      {/* 1. Summary Dashboard Skeleton (5 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Critical Skeleton */}
        <div className="rounded-xl border-y border-r border-[var(--navy-700)] border-l-4 border-l-red-500/70 bg-[var(--navy-900)] p-4 space-y-2.5">
          <div className="h-3 w-16 bg-red-950/50 rounded" />
          <div className="h-7 w-12 bg-[var(--navy-800)] rounded" />
          <div className="h-2.5 w-20 bg-[var(--navy-800)] rounded" />
        </div>

        {/* Serious Skeleton */}
        <div className="rounded-xl border-y border-r border-[var(--navy-700)] border-l-4 border-l-orange-500/70 bg-[var(--navy-900)] p-4 space-y-2.5">
          <div className="h-3 w-16 bg-orange-950/50 rounded" />
          <div className="h-7 w-12 bg-[var(--navy-800)] rounded" />
          <div className="h-2.5 w-20 bg-[var(--navy-800)] rounded" />
        </div>

        {/* Moderate Skeleton */}
        <div className="rounded-xl border-y border-r border-[var(--navy-700)] border-l-4 border-l-yellow-400/70 bg-[var(--navy-900)] p-4 space-y-2.5">
          <div className="h-3 w-16 bg-yellow-950/50 rounded" />
          <div className="h-7 w-12 bg-[var(--navy-800)] rounded" />
          <div className="h-2.5 w-20 bg-[var(--navy-800)] rounded" />
        </div>

        {/* Minor Skeleton */}
        <div className="rounded-xl border-y border-r border-[var(--navy-700)] border-l-4 border-l-slate-400/70 bg-[var(--navy-900)] p-4 space-y-2.5">
          <div className="h-3 w-16 bg-slate-900/50 rounded" />
          <div className="h-7 w-12 bg-[var(--navy-800)] rounded" />
          <div className="h-2.5 w-20 bg-[var(--navy-800)] rounded" />
        </div>

        {/* Total Issues Skeleton */}
        <div className="col-span-2 sm:col-span-1 rounded-xl border-y border-r border-slate-700/60 border-l-4 border-l-slate-500/70 bg-[var(--navy-850)] p-4 space-y-2.5">
          <div className="h-3 w-20 bg-slate-800 rounded" />
          <div className="h-7 w-12 bg-slate-700/60 rounded" />
          <div className="h-2.5 w-24 bg-slate-800 rounded" />
        </div>
      </div>

      {/* 2. Filter Chips Skeleton */}
      <div className="flex items-center gap-2 overflow-hidden py-1">
        <div className="h-7 w-16 bg-[var(--navy-800)] rounded-full" />
        <div className="h-7 w-20 bg-[var(--navy-800)] rounded-full" />
        <div className="h-7 w-20 bg-[var(--navy-800)] rounded-full" />
        <div className="h-7 w-24 bg-[var(--navy-800)] rounded-full" />
        <div className="h-7 w-16 bg-[var(--navy-800)] rounded-full" />
      </div>

      {/* 3. Main Split Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        {/* Left: Issue Cards Skeleton (70%) */}
        <div className="lg:col-span-7 space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="card !p-5 border-[var(--navy-800)] bg-[var(--navy-900)] space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-[var(--navy-800)] rounded-full" />
                  <div className="h-4 w-48 bg-[var(--navy-800)] rounded" />
                </div>
                <div className="h-4 w-24 bg-[var(--navy-800)] rounded" />
              </div>

              <div className="space-y-1.5">
                <div className="h-3 w-full bg-[var(--navy-800)] rounded" />
                <div className="h-3 w-4/5 bg-[var(--navy-800)] rounded" />
              </div>

              {/* Code snippet skeleton */}
              <div className="h-16 w-full rounded-lg bg-[var(--navy-950)] border border-[var(--navy-800)]" />

              {/* Fix box skeleton */}
              <div className="h-12 w-full rounded-lg bg-emerald-950/20 border-l-4 border-emerald-500/50" />
            </div>
          ))}
        </div>

        {/* Right: Sidebar Skeleton (30%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card !p-4 bg-[var(--navy-900)] space-y-3">
            <div className="h-3 w-24 bg-[var(--navy-800)] rounded" />
            <div className="h-4 w-full bg-[var(--navy-800)] rounded" />
          </div>

          <div className="card !p-6 bg-[var(--navy-900)] flex flex-col items-center space-y-4">
            <div className="w-28 h-28 rounded-full border-8 border-[var(--navy-800)] flex items-center justify-center">
              <div className="h-6 w-12 bg-[var(--navy-800)] rounded" />
            </div>
            <div className="h-3 w-32 bg-[var(--navy-800)] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
