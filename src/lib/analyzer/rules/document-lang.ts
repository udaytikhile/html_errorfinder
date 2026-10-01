import { Document } from "domhandler";
import { findAll, getAttributeValue } from "domutils";
import type { AccessibilityRule, Finding } from "../../types";

/**
 * Rule: document-lang
 * Checks that the <html> element has a lang attribute.
 */
export const documentLangRule: AccessibilityRule = {
  id: "document-lang",
  name: "Document Language",
  category: "document",
  check(document: Document): Finding[] {
    const findings: Finding[] = [];
    const htmlElements = findAll(
      (el) => el.type === "tag" && el.name === "html",
      document.children
    );

    if (htmlElements.length === 0) {
      // No <html> element — this might be a snippet, only flag if there's substantial content
      const allElements = findAll((el) => el.type === "tag", document.children);
      if (allElements.length > 3) {
        findings.push({
          ruleId: "document-lang-missing",
          title: "No html element with lang attribute",
          severity: "serious",
          confidence: "potential",
          explanation:
            "The page does not have an <html> element with a lang attribute. Screen readers use the language to select the correct pronunciation. This may be a code snippet rather than a full page.",
          element: "(no <html> element found)",
          fix: 'Wrap your content in <html lang="en"> (or the appropriate language code).',
          wcagCriterion: "3.1.1 Language of Page",
        });
      }
      return findings;
    }

    const htmlEl = htmlElements[0];
    const lang = getAttributeValue(htmlEl, "lang");

    if (lang === undefined || lang === null) {
      findings.push({
        ruleId: "document-lang-missing",
        title: "Missing lang attribute on html element",
        severity: "serious",
        confidence: "confirmed",
        explanation:
          "The <html> element is missing a lang attribute. Screen readers need this to determine the correct language for pronunciation. Without it, content may be read with the wrong accent or skipped entirely.",
        element: "<html>",
        fix: 'Add a lang attribute: <html lang="en"> (use the appropriate BCP 47 language code for your content).',
        wcagCriterion: "3.1.1 Language of Page",
      });
    } else if (lang.trim() === "") {
      findings.push({
        ruleId: "document-lang-empty",
        title: "Empty lang attribute on html element",
        severity: "serious",
        confidence: "confirmed",
        explanation:
          "The <html> element has an empty lang attribute. This is equivalent to not specifying a language at all.",
        element: '<html lang="">',
        fix: 'Set the lang attribute to a valid language code: <html lang="en">.',
        wcagCriterion: "3.1.1 Language of Page",
      });
    }

    return findings;
  },
};
