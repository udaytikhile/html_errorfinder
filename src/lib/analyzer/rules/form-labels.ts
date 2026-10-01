import { Document, Element } from "domhandler";
import { findAll, getAttributeValue, textContent } from "domutils";
import type { AccessibilityRule, Finding } from "../../types";

const FORM_CONTROLS = ["input", "select", "textarea"];
const EXEMPT_INPUT_TYPES = ["hidden", "submit", "reset", "button", "image"];

function getAccessibleName(el: Element, document: Document): string {
  // Check aria-labelledby
  const labelledBy = getAttributeValue(el, "aria-labelledby");
  if (labelledBy) {
    const ids = labelledBy.split(/\s+/);
    const allElements = findAll((e) => e.type === "tag", document.children);
    const texts = ids
      .map((id) => {
        const ref = allElements.find(
          (e) => getAttributeValue(e, "id") === id
        );
        return ref ? textContent(ref).trim() : "";
      })
      .filter(Boolean);
    if (texts.length > 0) return texts.join(" ");
  }

  // Check aria-label
  const ariaLabel = getAttributeValue(el, "aria-label");
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  // Check title
  const title = getAttributeValue(el, "title");
  if (title && title.trim()) return title.trim();

  // Check for associated label (by id)
  const id = getAttributeValue(el, "id");
  if (id) {
    const labels = findAll(
      (e) => e.type === "tag" && e.name === "label",
      document.children
    );
    const associatedLabel = labels.find(
      (l) => getAttributeValue(l, "for") === id
    );
    if (associatedLabel) {
      const labelText = textContent(associatedLabel).trim();
      if (labelText) return labelText;
    }
  }

  // Check for wrapping label
  let parent = el.parent;
  while (parent) {
    if (parent.type === "tag" && (parent as Element).name === "label") {
      const labelText = textContent(parent).trim();
      if (labelText) return labelText;
    }
    parent = parent.parent;
  }

  // Check placeholder as last resort (not a proper accessible name)
  const placeholder = getAttributeValue(el, "placeholder");
  if (placeholder && placeholder.trim()) return placeholder.trim();

  return "";
}

function safeElementSnippet(el: Element): string {
  const tag = el.name;
  const type = getAttributeValue(el, "type") || "";
  const name = getAttributeValue(el, "name") || "";
  const id = getAttributeValue(el, "id") || "";
  let snippet = `<${tag}`;
  if (type) snippet += ` type="${type}"`;
  if (name) snippet += ` name="${name}"`;
  if (id) snippet += ` id="${id}"`;
  snippet += ">";
  return snippet;
}

/**
 * Rule: form-labels
 * Checks that form controls have accessible names.
 */
export const formLabelsRule: AccessibilityRule = {
  id: "form-labels",
  name: "Form Control Labels",
  category: "forms",
  check(document: Document): Finding[] {
    const findings: Finding[] = [];
    const controls = findAll(
      (el) => el.type === "tag" && FORM_CONTROLS.includes(el.name),
      document.children
    );

    for (const control of controls) {
      const type = getAttributeValue(control, "type") || "text";

      // Skip exempt input types
      if (
        control.name === "input" &&
        EXEMPT_INPUT_TYPES.includes(type.toLowerCase())
      ) {
        continue;
      }

      const accessibleName = getAccessibleName(control, document);
      if (!accessibleName) {
        findings.push({
          ruleId: "form-label-missing",
          title: "Form control without accessible name",
          severity: "critical",
          confidence: "confirmed",
          explanation:
            "Form controls need an accessible name so screen reader users know what information to enter. Without a label, the control is unusable for assistive technology users.",
          element: safeElementSnippet(control),
          fix: `Add a <label for="controlId"> element, or use aria-label="..." or aria-labelledby="..." to provide an accessible name.`,
          wcagCriterion: "1.3.1 Info and Relationships",
        });
      }
    }

    return findings;
  },
};
