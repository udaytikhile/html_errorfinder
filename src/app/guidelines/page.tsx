"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  FormInput,
  Keyboard,
  Palette,
  Heading1,
  Code2,
  Eye,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface GuidelineSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  principle: string;
  description: string;
  tips: string[];
  checkedByTool: boolean;
}

const guidelines: GuidelineSection[] = [
  {
    id: "alt-text",
    title: "Alternative Text",
    icon: <ImageIcon className="w-5 h-5" />,
    principle: "Perceivable",
    description:
      "Images must have alternative text that describes their content or function. Screen readers announce this text to users who cannot see the images.",
    tips: [
      "Every informative image needs a descriptive alt attribute",
      'Decorative images should use alt="" or role="presentation"',
      "Don't start alt text with 'image of' or 'picture of'",
      "Keep alt text concise but descriptive",
      "Complex images (charts, diagrams) may need longer descriptions",
    ],
    checkedByTool: true,
  },
  {
    id: "form-labels",
    title: "Accessible Form Labels",
    icon: <FormInput className="w-5 h-5" />,
    principle: "Perceivable",
    description:
      "Form controls must have accessible names so screen reader users know what information to enter. Labels should be clear and descriptive.",
    tips: [
      "Use <label> elements associated with form controls via the 'for' attribute",
      "Alternatively, wrap form controls inside <label> elements",
      "Use aria-label or aria-labelledby for controls without visible labels",
      "Placeholder text is not a substitute for labels",
      "Group related controls with <fieldset> and <legend>",
    ],
    checkedByTool: true,
  },
  {
    id: "keyboard",
    title: "Keyboard Accessibility",
    icon: <Keyboard className="w-5 h-5" />,
    principle: "Operable",
    description:
      "All interactive elements must be usable with a keyboard alone. Many users cannot use a mouse due to motor disabilities.",
    tips: [
      "Use semantic HTML elements (button, a, input) which are keyboard-accessible by default",
      "Ensure visible focus indicators for all interactive elements",
      "Don't use tabindex values greater than 0",
      "Test your page by navigating with Tab, Shift+Tab, Enter, and Escape",
      "Avoid keyboard traps — users must be able to navigate away from any element",
    ],
    checkedByTool: false,
  },
  {
    id: "color-contrast",
    title: "Color Contrast",
    icon: <Palette className="w-5 h-5" />,
    principle: "Perceivable",
    description:
      "Text must have sufficient contrast against its background. Low contrast makes text difficult or impossible to read for users with low vision.",
    tips: [
      "Normal text needs at least 4.5:1 contrast ratio (WCAG AA)",
      "Large text (18pt or 14pt bold) needs at least 3:1 ratio",
      "Don't rely on color alone to convey information",
      "Test with tools like the WebAIM Contrast Checker",
      "Consider users in different lighting conditions",
    ],
    checkedByTool: false,
  },
  {
    id: "headings",
    title: "Heading Structure",
    icon: <Heading1 className="w-5 h-5" />,
    principle: "Perceivable",
    description:
      "Headings create a document outline that screen reader users rely on for navigation. A logical heading hierarchy helps all users understand page structure.",
    tips: [
      "Use one <h1> per page for the main topic",
      "Don't skip heading levels (e.g., h1 to h3 without h2)",
      "Don't use headings just for visual styling — use CSS instead",
      "Heading text should be descriptive and concise",
      "Screen readers can list all headings for quick navigation",
    ],
    checkedByTool: true,
  },
  {
    id: "aria",
    title: "ARIA Usage",
    icon: <Code2 className="w-5 h-5" />,
    principle: "Robust",
    description:
      "WAI-ARIA attributes enhance accessibility when native HTML isn't sufficient. However, incorrect ARIA can make things worse than no ARIA at all.",
    tips: [
      "First rule of ARIA: Don't use ARIA if native HTML will work",
      "Use valid ARIA roles, states, and properties",
      "Ensure aria-labelledby and aria-describedby reference existing IDs",
      "Don't override native semantics without good reason",
      "Test with actual screen readers to verify ARIA behavior",
    ],
    checkedByTool: true,
  },
  {
    id: "wcag-principles",
    title: "WCAG Principles",
    icon: <BookOpen className="w-5 h-5" />,
    principle: "All",
    description:
      "The Web Content Accessibility Guidelines (WCAG) are organized around four principles. All web content should meet these principles to be accessible.",
    tips: [
      "Perceivable: Users can perceive all content (alt text, captions, contrast)",
      "Operable: Users can interact with all controls (keyboard, timing, navigation)",
      "Understandable: Content is readable and predictable (language, labels, errors)",
      "Robust: Content works with current and future assistive technologies",
    ],
    checkedByTool: false,
  },
];

export default function GuidelinesPage() {
  const [expandedId, setExpandedId] = useState<string | null>("alt-text");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Accessibility Guidelines
        </h1>
        <p className="text-sm text-[var(--gray-400)] mt-1">
          Learn key accessibility concepts and best practices
        </p>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-[var(--navy-800)] border border-[var(--navy-700)]">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-[var(--teal-400)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--gray-200)] mb-1">
              Educational Reference
            </p>
            <p className="text-xs text-[var(--gray-400)] leading-relaxed">
              This page provides educational guidance about web accessibility.
              Topics marked with a checkmark (✓) are checked by our automated
              analyzer. Topics without a checkmark require manual testing or
              additional tools. For the complete WCAG specification, visit{" "}
              <a
                href="https://www.w3.org/WAI/WCAG21/quickref/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--teal-400)] hover:underline"
              >
                WCAG Quick Reference
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="space-y-3">
        {guidelines.map((guideline) => (
          <div key={guideline.id} className="card">
            <button
              className="w-full text-left flex items-start gap-4 bg-transparent border-none cursor-pointer p-0"
              onClick={() =>
                setExpandedId(
                  expandedId === guideline.id ? null : guideline.id
                )
              }
              aria-expanded={expandedId === guideline.id}
            >
              <div className="w-10 h-10 rounded-lg bg-[rgba(20,184,166,0.1)] flex items-center justify-center flex-shrink-0 text-[var(--teal-400)]">
                {guideline.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-base font-semibold text-white">
                    {guideline.title}
                  </h2>
                  <span className="badge badge-minor !text-[10px]">
                    {guideline.principle}
                  </span>
                  {guideline.checkedByTool ? (
                    <span className="flex items-center gap-1 text-xs text-[var(--emerald-400)]">
                      <CheckCircle2 className="w-3 h-3" />
                      Checked by tool
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-[var(--gray-500)]">
                      <AlertTriangle className="w-3 h-3" />
                      Manual testing needed
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--gray-400)] mt-1 line-clamp-2">
                  {guideline.description}
                </p>
              </div>
            </button>

            {expandedId === guideline.id && (
              <div className="mt-4 pt-4 border-t border-[var(--navy-700)] animate-fade-in">
                <p className="text-sm text-[var(--gray-300)] mb-4 leading-relaxed">
                  {guideline.description}
                </p>
                <h3 className="text-xs font-semibold text-[var(--gray-300)] uppercase tracking-wider mb-3">
                  Best Practices
                </h3>
                <ul className="space-y-2">
                  {guideline.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-[var(--gray-400)]"
                    >
                      <span className="text-[var(--teal-400)] mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
