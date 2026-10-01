import { Document, Element } from "domhandler";
import { findAll, getAttributeValue, textContent } from "domutils";
import type { AccessibilityRule, Finding } from "../../types";

function getVisibleText(el: Element): string {
  return textContent(el).trim();
}

function hasAriaLabel(el: Element): boolean {
  const ariaLabel = getAttributeValue(el, "aria-label");
  return !!ariaLabel && ariaLabel.trim().length > 0;
}

function hasAriaLabelledBy(el: Element): boolean {
  const labelledBy = getAttributeValue(el, "aria-labelledby");
  return !!labelledBy && labelledBy.trim().length > 0;
}

function hasImage(el: Element): boolean {
  const images = findAll(
    (child) => child.type === "tag" && child.name === "img",
    el.children
  );
  return images.some((img) => {
    const alt = getAttributeValue(img, "alt");
    return alt !== undefined && alt.trim().length > 0;
  });
}

function safeSnippet(el: Element): string {
  const tag = el.name;
  const href = getAttributeValue(el, "href") || "";
  const truncatedHref =
    href.length > 60 ? href.substring(0, 60) + "..." : href;
  const id = getAttributeValue(el, "id") || "";
  const cls = getAttributeValue(el, "class") || "";
  let snippet = `<${tag}`;
  if (href) snippet += ` href="${truncatedHref}"`;
  if (id) snippet += ` id="${id}"`;
  if (cls) {
    const shortCls =
      cls.length > 40 ? cls.substring(0, 40) + "..." : cls;
    snippet += ` class="${shortCls}"`;
  }
  snippet += `></${tag}>`;
  return snippet;
}

/**
 * Rule: empty-links
 * Checks for links and buttons with no accessible text.
 */
export const emptyLinksRule: AccessibilityRule = {
  id: "empty-links",
  name: "Empty Links and Buttons",
  category: "links",
  check(document: Document): Finding[] {
    const findings: Finding[] = [];

    // Check links
    const links = findAll(
      (el) => el.type === "tag" && el.name === "a",
      document.children
    );

    for (const link of links) {
      const text = getVisibleText(link);
      if (
        !text &&
        !hasAriaLabel(link) &&
        !hasAriaLabelledBy(link) &&
        !hasImage(link)
      ) {
        const title = getAttributeValue(link, "title");
        if (!title || !title.trim()) {
          findings.push({
            ruleId: "link-empty",
            title: "Link has no accessible text",
            severity: "serious",
            confidence: "confirmed",
            explanation:
              "Links must have discernible text so screen reader users know where the link goes. A link without text is announced as just 'link' which is meaningless.",
            element: safeSnippet(link),
            fix: "Add text content, an aria-label, or an image with alt text inside the link.",
            wcagCriterion: "2.4.4 Link Purpose",
          });
        }
      }
    }

    // Check buttons
    const buttons = findAll(
      (el) => el.type === "tag" && el.name === "button",
      document.children
    );

    for (const button of buttons) {
      const text = getVisibleText(button);
      if (
        !text &&
        !hasAriaLabel(button) &&
        !hasAriaLabelledBy(button) &&
        !hasImage(button)
      ) {
        const title = getAttributeValue(button, "title");
        if (!title || !title.trim()) {
          findings.push({
            ruleId: "button-empty",
            title: "Button has no accessible text",
            severity: "serious",
            confidence: "confirmed",
            explanation:
              "Buttons must have discernible text so screen reader users know what the button does. A button without text is announced as just 'button'.",
            element: safeSnippet(button),
            fix: "Add text content or an aria-label to the button.",
            wcagCriterion: "4.1.2 Name, Role, Value",
          });
        }
      }
    }

    return findings;
  },
};
