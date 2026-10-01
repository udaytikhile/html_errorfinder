import type { Severity } from "@/lib/types";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
  showDot?: boolean;
}

const severityConfig: Record<
  Severity,
  { label: string; className: string; dotColor: string }
> = {
  critical: {
    label: "Critical",
    className: "badge-critical",
    dotColor: "bg-red-400",
  },
  serious: {
    label: "Serious",
    className: "badge-serious",
    dotColor: "bg-orange-400",
  },
  moderate: {
    label: "Moderate",
    className: "badge-moderate",
    dotColor: "bg-yellow-400",
  },
  minor: {
    label: "Minor",
    className: "badge-minor",
    dotColor: "bg-slate-400",
  },
};

export default function SeverityBadge({
  severity,
  className = "",
  showDot = true,
}: SeverityBadgeProps) {
  const config = severityConfig[severity];
  return (
    <span
      className={`badge ${config.className} gap-1.5 font-semibold text-[11px] tracking-wider ${className}`}
      role="status"
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}
