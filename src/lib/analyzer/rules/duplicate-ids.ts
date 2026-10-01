import { Document } from "domhandler";
import { findAll, getAttributeValue } from "domutils";
import type { AccessibilityRule, Finding } from "../../types";

/**
 * Rule: duplicate-ids
 * Checks for duplicate id attributes in the document.
 */
export const duplicateIdsRule: AccessibilityRule = {
  id: "duplicate-ids",
  name: "Duplicate Element IDs",
  category: "ids",
  check(document: Document): Finding[] {
    const findings: Finding[] = [];
    const allElements = findAll((el) => el.type === "tag", document.children);

    const idMap = new Map<string, number>();
    for (const el of allElements) {
      const id = getAttributeValue(el, "id");
      if (id && id.trim()) {
        const trimmedId = id.trim();
        idMap.set(trimmedId, (idMap.get(trimmedId) || 0) + 1);
      }
    }

    for (const [id, count] of idMap) {
      if (count > 1) {
        findings.push({
          ruleId: "duplicate-id",
          title: `Duplicate id: "${id}" (used ${count} times)`,
          severity: "serious",
          confidence: "confirmed",
          explanation: `The id "${id}" is used on ${count} elements. IDs must be unique in a document. Duplicate IDs break label associations, ARIA references, and fragment navigation.`,
          element: `[id="${id}"] (${count} elements)`,
          fix: `Ensure each id attribute is unique. Rename duplicates to distinct values like "${id}-1", "${id}-2", etc.`,
          wcagCriterion: "4.1.1 Parsing",
        });
      }
    }

    return findings;
  },
};
