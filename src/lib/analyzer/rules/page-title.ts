import { Document } from "domhandler";
import { findAll, textContent } from "domutils";
import type { AccessibilityRule, Finding } from "../../types";

/**
 * Rule: page-title
 * Checks that the page has a <title> element with content.
 */
export const pageTitleRule: AccessibilityRule = {
  id: "page-title",
  name: "Page Title",
  category: "document",
  check(document: Document): Finding[] {
    const findings: Finding[] = [];

    // Find <head> first
    const heads = findAll(
      (el) => el.type === "tag" && el.name === "head",
      document.children
    );

    if (heads.length === 0) {
      // No head element — might be a snippet, check if there's an html element
      const htmlElements = findAll(
        (el) => el.type === "tag" && el.name === "html",
        document.children
      );
      if (htmlElements.length > 0) {
        findings.push({
          ruleId: "page-title-missing",
          title: "Page is missing a title element",
          severity: "serious",
          confidence: "confirmed",
          explanation:
            "The page has an <html> element but no <head> with a <title>. Page titles are essential for screen reader users to identify the page and for browser tabs.",
          element: "(no <title> found)",
          fix: "Add a <head> section with a descriptive <title>: <head><title>Page Title</title></head>.",
          wcagCriterion: "2.4.2 Page Titled",
        });
      }
      return findings;
    }

    const titles = findAll(
      (el) => el.type === "tag" && el.name === "title",
      heads[0].children
    );

    if (titles.length === 0) {
      findings.push({
        ruleId: "page-title-missing",
        title: "Page is missing a title element",
        severity: "serious",
        confidence: "confirmed",
        explanation:
          "The page does not have a <title> element. Screen readers announce the page title when a user navigates to the page. Browser tabs also display the title.",
        element: "<head>...</head>",
        fix: "Add a descriptive <title> element inside <head>: <title>Your Page Title</title>.",
        wcagCriterion: "2.4.2 Page Titled",
      });
    } else {
      const titleText = textContent(titles[0]).trim();
      if (!titleText) {
        findings.push({
          ruleId: "page-title-empty",
          title: "Page title is empty",
          severity: "serious",
          confidence: "confirmed",
          explanation:
            "The page has a <title> element but it contains no text. An empty title provides no information to screen reader users or browser tabs.",
          element: "<title></title>",
          fix: "Add descriptive text to the title element: <title>Your Page Title</title>.",
          wcagCriterion: "2.4.2 Page Titled",
        });
      }
    }

    return findings;
  },
};
