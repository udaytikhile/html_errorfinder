import { Document } from "domhandler";
import { findAll, getAttributeValue } from "domutils";
import type { AccessibilityRule, Finding } from "../../types";

/**
 * Rule: img-alt
 * Checks images for missing or empty alt attributes.
 * Decorative images (role="presentation" or role="none") are excluded.
 */
export const imgAltRule: AccessibilityRule = {
  id: "img-alt",
  name: "Image Alternative Text",
  category: "images",
  check(document: Document): Finding[] {
    const findings: Finding[] = [];
    const images = findAll(
      (el) => el.type === "tag" && el.name === "img",
      document.children
    );

    for (const img of images) {
      const role = getAttributeValue(img, "role");
      // Skip decorative images
      if (role === "presentation" || role === "none") continue;

      const alt = getAttributeValue(img, "alt");
      const src = getAttributeValue(img, "src") || "";
      const truncatedSrc =
        src.length > 80 ? src.substring(0, 80) + "..." : src;

      if (alt === undefined) {
        findings.push({
          ruleId: "img-alt-missing",
          title: "Image missing alt attribute",
          severity: "critical",
          confidence: "confirmed",
          explanation:
            "Images must have an alt attribute so screen readers can describe them to users who cannot see. Without alt text, the image is invisible to assistive technology users.",
          element: `<img src="${truncatedSrc}">`,
          fix: 'Add an alt attribute describing the image content: <img src="..." alt="Description of image">. If the image is decorative, use alt="" or role="presentation".',
          wcagCriterion: "1.1.1 Non-text Content",
        });
      } else if (alt.trim() === "") {
        // Empty alt is valid for decorative images but suspicious without role
        if (!role) {
          findings.push({
            ruleId: "img-alt-empty",
            title: "Image has empty alt attribute",
            severity: "moderate",
            confidence: "potential",
            explanation:
              'An empty alt="" marks an image as decorative, meaning screen readers will skip it. If this image conveys information, it needs descriptive alt text.',
            element: `<img src="${truncatedSrc}" alt="">`,
            fix: 'If the image is decorative, this is correct. If it conveys information, add descriptive text: alt="Description". Consider adding role="presentation" for decorative images.',
            wcagCriterion: "1.1.1 Non-text Content",
          });
        }
      }
    }

    return findings;
  },
};
