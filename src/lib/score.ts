import type { SeverityBreakdown, Severity } from "./types";

/** Severity weight for score deduction */
const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 15,
  serious: 8,
  moderate: 3,
  minor: 1,
};

/**
 * Calculate an estimated accessibility score (0-100).
 *
 * Formula: score = max(0, 100 - Σ(severity_weight × count))
 *
 * This is an estimated score based on automated checks only.
 * It is NOT an official WCAG compliance rating.
 */
export function calculateScore(breakdown: SeverityBreakdown): number {
  const deductions =
    breakdown.critical * SEVERITY_WEIGHTS.critical +
    breakdown.serious * SEVERITY_WEIGHTS.serious +
    breakdown.moderate * SEVERITY_WEIGHTS.moderate +
    breakdown.minor * SEVERITY_WEIGHTS.minor;

  return Math.max(0, 100 - deductions);
}

/**
 * Get a label for the score range.
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Improvement";
  if (score >= 30) return "Poor";
  return "Critical Issues";
}

/**
 * Get the color class for a score.
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 70) return "text-teal-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 30) return "text-orange-400";
  return "text-red-400";
}

/**
 * Get the severity weights documentation.
 */
export function getScoreFormula(): string {
  return `Score = max(0, 100 - Σ(severity_weight × count))
  Critical: ${SEVERITY_WEIGHTS.critical} points each
  Serious: ${SEVERITY_WEIGHTS.serious} points each
  Moderate: ${SEVERITY_WEIGHTS.moderate} points each
  Minor: ${SEVERITY_WEIGHTS.minor} point each

This is an estimated score. Automated checks cannot identify every accessibility barrier.`;
}
