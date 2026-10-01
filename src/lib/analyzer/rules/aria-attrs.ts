import { Document, Element } from "domhandler";
import { findAll, getAttributeValue } from "domutils";
import type { AccessibilityRule, Finding } from "../../types";

// Valid ARIA roles (subset of common ones)
const VALID_ROLES = new Set([
  "alert", "alertdialog", "application", "article", "banner", "button",
  "cell", "checkbox", "columnheader", "combobox", "complementary",
  "contentinfo", "definition", "dialog", "directory", "document",
  "feed", "figure", "form", "grid", "gridcell", "group", "heading",
  "img", "link", "list", "listbox", "listitem", "log", "main",
  "marquee", "math", "menu", "menubar", "menuitem", "menuitemcheckbox",
  "menuitemradio", "navigation", "none", "note", "option", "presentation",
  "progressbar", "radio", "radiogroup", "region", "row", "rowgroup",
  "rowheader", "scrollbar", "search", "searchbox", "separator", "slider",
  "spinbutton", "status", "switch", "tab", "table", "tablist", "tabpanel",
  "term", "textbox", "timer", "toolbar", "tooltip", "tree", "treegrid",
  "treeitem",
]);

// ARIA attributes that reference element IDs
const ARIA_ID_REF_ATTRS = [
  "aria-labelledby",
  "aria-describedby",
  "aria-controls",
  "aria-owns",
  "aria-activedescendant",
  "aria-details",
  "aria-errormessage",
  "aria-flowto",
];

/**
 * Rule: aria-attrs
 * Checks for suspicious or invalid ARIA attribute usage.
 */
export const ariaAttrsRule: AccessibilityRule = {
  id: "aria-attrs",
  name: "ARIA Attribute Usage",
  category: "aria",
  check(document: Document): Finding[] {
    const findings: Finding[] = [];
    const allElements = findAll((el) => el.type === "tag", document.children);

    // Build a set of all IDs in the document
    const documentIds = new Set<string>();
    for (const el of allElements) {
      const id = getAttributeValue(el, "id");
      if (id && id.trim()) documentIds.add(id.trim());
    }

    for (const el of allElements) {
      // Check for invalid role values
      const role = getAttributeValue(el, "role");
      if (role && role.trim()) {
        const roles = role.trim().split(/\s+/);
        for (const r of roles) {
          if (!VALID_ROLES.has(r.toLowerCase())) {
            findings.push({
              ruleId: "aria-invalid-role",
              title: `Invalid ARIA role: "${r}"`,
              severity: "serious",
              confidence: "confirmed",
              explanation: `The role "${r}" is not a valid WAI-ARIA role. Invalid roles are ignored by assistive technology, which may cause the element to lose its intended semantics.`,
              element: safeSnippet(el),
              fix: `Use a valid ARIA role. Common roles include: button, link, navigation, main, banner, form, search.`,
              wcagCriterion: "4.1.2 Name, Role, Value",
            });
          }
        }
      }

      // Check ARIA ID references point to existing elements
      for (const attr of ARIA_ID_REF_ATTRS) {
        const value = getAttributeValue(el, attr);
        if (value && value.trim()) {
          const ids = value.trim().split(/\s+/);
          for (const refId of ids) {
            if (!documentIds.has(refId)) {
              findings.push({
                ruleId: "aria-broken-reference",
                title: `${attr} references nonexistent id "${refId}"`,
                severity: "serious",
                confidence: "confirmed",
                explanation: `The ${attr} attribute references id "${refId}", but no element with that id exists in the document. This breaks the ARIA relationship.`,
                element: safeSnippet(el),
                fix: `Either add an element with id="${refId}" or update the ${attr} value to reference an existing element id.`,
                wcagCriterion: "4.1.2 Name, Role, Value",
              });
            }
          }
        }
      }
    }

    return findings;
  },
};

function safeSnippet(el: Element): string {
  const tag = el.name;
  const id = getAttributeValue(el, "id") || "";
  const role = getAttributeValue(el, "role") || "";
  let snippet = `<${tag}`;
  if (id) snippet += ` id="${id}"`;
  if (role) snippet += ` role="${role}"`;
  // Include first aria- attribute for context
  const attrs = Object.keys(el.attribs || {});
  const ariaAttr = attrs.find(
    (a) => a.startsWith("aria-") && a !== "aria-label"
  );
  if (ariaAttr) {
    const val = el.attribs[ariaAttr];
    const truncated = val.length > 40 ? val.substring(0, 40) + "..." : val;
    snippet += ` ${ariaAttr}="${truncated}"`;
  }
  snippet += ">";
  return snippet;
}
