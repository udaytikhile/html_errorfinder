// ── Severity Levels ──────────────────────────────────────────────
export type Severity = "critical" | "serious" | "moderate" | "minor";

// ── Confidence ───────────────────────────────────────────────────
export type Confidence = "confirmed" | "potential";

// ── Single Finding ───────────────────────────────────────────────
export interface Finding {
  /** Unique rule ID, e.g. "img-alt-missing" */
  ruleId: string;
  /** Short human-readable title */
  title: string;
  /** Impact severity */
  severity: Severity;
  /** Whether this is a confirmed violation or a potential issue */
  confidence: Confidence;
  /** Explanation of why this matters */
  explanation: string;
  /** Affected element as a safe HTML snippet (attributes may be truncated) */
  element: string;
  /** Recommended fix */
  fix: string;
  /** Relevant WCAG criterion, only when accurately mapped */
  wcagCriterion?: string;
  /** Gemini-generated detailed explanation (populated on demand) */
  geminiExplanation?: string;
  /** Gemini-generated corrected HTML example */
  geminiFixExample?: string;
}

// ── Rule Category ────────────────────────────────────────────────
export type RuleCategory =
  | "images"
  | "forms"
  | "headings"
  | "links"
  | "document"
  | "aria"
  | "ids";

// ── Rule Definition ──────────────────────────────────────────────
export interface AccessibilityRule {
  /** Unique rule ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Category for filtering */
  category: RuleCategory;
  /** Run the rule against a parsed DOM and return findings */
  check: (document: import("domhandler").Document) => Finding[];
}

// ── Severity Breakdown ───────────────────────────────────────────
export interface SeverityBreakdown {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

// ── Scan Result ──────────────────────────────────────────────────
export interface ScanResult {
  /** Unique scan ID (UUID) */
  id: string;
  /** ISO timestamp of when the scan was performed */
  timestamp: string;
  /** Source: pasted HTML or fetched URL */
  source: "html" | "url";
  /** The original URL if source is "url" */
  url?: string;
  /** Truncated snippet of the scanned HTML for reference */
  htmlSnippet: string;
  /** All findings from the scan */
  findings: Finding[];
  /** Severity breakdown counts */
  severityBreakdown: SeverityBreakdown;
  /** Estimated accessibility score (0-100) */
  score: number;
  /** Total number of elements analyzed */
  elementsAnalyzed: number;
  /** Total number of rules checked */
  rulesChecked: number;
}

// ── Scan Input ───────────────────────────────────────────────────
export interface ScanInput {
  source: "html" | "url";
  html?: string;
  url?: string;
}

// ── Scan History Entry ───────────────────────────────────────────
export interface ScanHistoryEntry {
  id: string;
  timestamp: string;
  source: "html" | "url";
  url?: string;
  score: number;
  totalFindings: number;
  severityBreakdown: SeverityBreakdown;
  /** Full scan result stored for viewing the report */
  result: ScanResult;
}
