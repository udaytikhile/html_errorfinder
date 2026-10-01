import { Document } from "domhandler";
import { findAll, getAttributeValue } from "domutils";
import type { AccessibilityRule, Finding } from "../../types";

/**
 * Rule: label-for
 * Checks that <label for="..."> references an existing form control.
 */
export const labelForRule: AccessibilityRule = {
  id: "label-for",
  name: "Label References",
  category: "forms",
  check(document: Document): Finding[] {
    const findings: Finding[] = [];
    const allElements = findAll((el) => el.type === "tag", document.children);

    // Build a set of all IDs in the document
    const documentIds = new Set<string>();
    for (const el of allElements) {
      const id = getAttributeValue(el, "id");
      if (id && id.trim()) documentIds.add(id.trim());
    }

    // Find all labels with for attribute
    const labels = findAll(
      (el) => el.type === "tag" && el.name === "label",
      document.children
    );

    for (const label of labels) {
      const forAttr = getAttributeValue(label, "for");
      if (forAttr && forAttr.trim()) {
        const targetId = forAttr.trim();
        if (!documentIds.has(targetId)) {
          findings.push({
            ruleId: "label-for-nonexistent",
            title: `Label references nonexistent element "${targetId}"`,
            severity: "serious",
            confidence: "confirmed",
            explanation: `A <label> element has for="${targetId}", but no element with id="${targetId}" exists. This label is not associated with any form control, making the form harder to use.`,
            element: `<label for="${targetId}">`,
            fix: `Either add id="${targetId}" to the target form control, or update the label's for attribute to match an existing element's id.`,
            wcagCriterion: "1.3.1 Info and Relationships",
          });
        }
      }
    }

    return findings;
  },
};
