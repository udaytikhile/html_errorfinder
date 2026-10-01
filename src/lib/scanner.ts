import { parseDocument } from "htmlparser2";
import { findAll } from "domutils";
import { allRules } from "./analyzer/rules";
import { calculateScore } from "./score";
import type { Finding, ScanResult, SeverityBreakdown } from "./types";

/**
 * Run all accessibility rules against the given HTML string.
 * Returns a complete ScanResult with findings, score, and metadata.
 */
export function analyzeHtml(
  html: string,
  source: "html" | "url",
  url?: string
): ScanResult {
  // Parse the HTML safely — htmlparser2 does NOT execute scripts
  const document = parseDocument(html, {
    decodeEntities: true,
  });

  // Count total elements for metadata
  const allElements = findAll((el) => el.type === "tag", document.children);
  const elementsAnalyzed = allElements.length;

  // Run each rule and collect findings
  const findings: Finding[] = [];
  for (const rule of allRules) {
    try {
      const ruleFindings = rule.check(document);
      findings.push(...ruleFindings);
    } catch (error) {
      // If a rule fails, log but don't crash the entire scan
      console.error(`Rule "${rule.id}" failed:`, error);
    }
  }

  // Calculate severity breakdown
  const severityBreakdown: SeverityBreakdown = {
    critical: findings.filter((f) => f.severity === "critical").length,
    serious: findings.filter((f) => f.severity === "serious").length,
    moderate: findings.filter((f) => f.severity === "moderate").length,
    minor: findings.filter((f) => f.severity === "minor").length,
  };

  // Calculate score
  const score = calculateScore(severityBreakdown);

  // Create a safe HTML snippet for reference (truncated)
  const htmlSnippet =
    html.length > 500 ? html.substring(0, 500) + "..." : html;

  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    source,
    url,
    htmlSnippet,
    findings,
    severityBreakdown,
    score,
    elementsAnalyzed,
    rulesChecked: allRules.length,
  };
}

/**
 * Generate a simple unique ID.
 */
function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 9)
  );
}
