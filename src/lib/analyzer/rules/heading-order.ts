import { Document } from "domhandler";
import { findAll, textContent } from "domutils";
import type { AccessibilityRule, Finding } from "../../types";

/**
 * Rule: heading-order
 * Checks that heading levels don't skip (e.g., h1 -> h3 without h2).
 */
export const headingOrderRule: AccessibilityRule = {
  id: "heading-order",
  name: "Heading Hierarchy",
  category: "headings",
  check(document: Document): Finding[] {
    const findings: Finding[] = [];
    const headings = findAll(
      (el) =>
        el.type === "tag" && /^h[1-6]$/.test(el.name),
      document.children
    );

    if (headings.length === 0) return findings;

    // Check if first heading is not h1
    const firstHeading = headings[0];
    const firstLevel = parseInt(firstHeading.name.charAt(1), 10);
    if (firstLevel !== 1) {
      findings.push({
        ruleId: "heading-first-not-h1",
        title: "First heading is not h1",
        severity: "moderate",
        confidence: "potential",
        explanation:
          "The first heading on a page should typically be an h1, which represents the main topic. Starting with a different level can confuse screen reader users navigating by headings.",
        element: `<${firstHeading.name}>${textContent(firstHeading).trim().substring(0, 60)}</${firstHeading.name}>`,
        fix: `Change the first heading to an <h1> element, or add an appropriate <h1> before it.`,
        wcagCriterion: "1.3.1 Info and Relationships",
      });
    }

    // Check for skipped levels
    let previousLevel = 0;
    for (const heading of headings) {
      const level = parseInt(heading.name.charAt(1), 10);
      const headingText = textContent(heading).trim().substring(0, 60);

      if (previousLevel > 0 && level > previousLevel + 1) {
        findings.push({
          ruleId: "heading-skip-level",
          title: `Heading level skipped from h${previousLevel} to h${level}`,
          severity: "moderate",
          confidence: "confirmed",
          explanation: `Heading levels were skipped from h${previousLevel} to h${level}. Screen reader users rely on heading hierarchy to understand page structure. Skipping levels makes the structure confusing.`,
          element: `<${heading.name}>${headingText}</${heading.name}>`,
          fix: `Use an <h${previousLevel + 1}> instead, or add the missing intermediate heading levels.`,
          wcagCriterion: "1.3.1 Info and Relationships",
        });
      }

      // Check for empty headings
      if (!headingText) {
        findings.push({
          ruleId: "heading-empty",
          title: `Empty heading (${heading.name})`,
          severity: "serious",
          confidence: "confirmed",
          explanation:
            "Empty headings are announced by screen readers but provide no useful information. They create confusing navigation landmarks.",
          element: `<${heading.name}></${heading.name}>`,
          fix: `Add descriptive text to the heading, or remove the empty heading element.`,
          wcagCriterion: "2.4.6 Headings and Labels",
        });
      }

      previousLevel = level;
    }

    return findings;
  },
};
