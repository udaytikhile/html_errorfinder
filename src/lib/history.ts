import type { ScanHistoryEntry, ScanResult } from "./types";

const HISTORY_KEY = "accessable-ai-history";
const MAX_HISTORY = 50;

/**
 * Get all scan history entries from localStorage.
 * Returns an empty array if data is missing or corrupted.
 */
export function getHistory(): ScanHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Basic validation: each entry should have at minimum an id and timestamp
    return parsed.filter(
      (entry: unknown) =>
        typeof entry === "object" &&
        entry !== null &&
        "id" in entry &&
        "timestamp" in entry &&
        "result" in entry
    ) as ScanHistoryEntry[];
  } catch {
    // Corrupted data — return empty array rather than crashing
    console.warn("Scan history data was corrupted and has been reset.");
    return [];
  }
}

/**
 * Save a scan result to history.
 */
export function saveToHistory(result: ScanResult): ScanHistoryEntry {
  const entry: ScanHistoryEntry = {
    id: result.id,
    timestamp: result.timestamp,
    source: result.source,
    url: result.url,
    score: result.score,
    totalFindings: result.findings.length,
    severityBreakdown: result.severityBreakdown,
    result,
  };

  const history = getHistory();
  // Add new entry at the beginning
  history.unshift(entry);
  // Trim to max size
  const trimmed = history.slice(0, MAX_HISTORY);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save scan history:", error);
  }

  return entry;
}

/**
 * Get a single history entry by ID.
 */
export function getHistoryEntry(id: string): ScanHistoryEntry | undefined {
  const history = getHistory();
  return history.find((entry) => entry.id === id);
}

/**
 * Delete a single history entry by ID.
 */
export function deleteHistoryEntry(id: string): void {
  const history = getHistory();
  const filtered = history.filter((entry) => entry.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to update scan history:", error);
  }
}

/**
 * Clear all scan history.
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear scan history:", error);
  }
}

/**
 * Get aggregated stats from all history entries.
 */
export function getHistoryStats() {
  const history = getHistory();
  const totalScans = history.length;
  const totalIssues = history.reduce((sum, e) => sum + e.totalFindings, 0);
  const criticalIssues = history.reduce(
    (sum, e) => sum + e.severityBreakdown.critical,
    0
  );
  const seriousIssues = history.reduce(
    (sum, e) => sum + e.severityBreakdown.serious,
    0
  );
  const moderateIssues = history.reduce(
    (sum, e) => sum + (e.severityBreakdown?.moderate || 0),
    0
  );
  const minorIssues = history.reduce(
    (sum, e) => sum + (e.severityBreakdown?.minor || 0),
    0
  );
  const recentScans = history.slice(0, 5);

  return {
    totalScans,
    totalIssues,
    criticalIssues,
    seriousIssues,
    moderateIssues,
    minorIssues,
    recentScans,
  };
}
