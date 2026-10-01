export { imgAltRule } from "./img-alt";
export { formLabelsRule } from "./form-labels";
export { headingOrderRule } from "./heading-order";
export { documentLangRule } from "./document-lang";
export { pageTitleRule } from "./page-title";
export { emptyLinksRule } from "./empty-links";
export { duplicateIdsRule } from "./duplicate-ids";
export { ariaAttrsRule } from "./aria-attrs";
export { labelForRule } from "./label-for";

import { imgAltRule } from "./img-alt";
import { formLabelsRule } from "./form-labels";
import { headingOrderRule } from "./heading-order";
import { documentLangRule } from "./document-lang";
import { pageTitleRule } from "./page-title";
import { emptyLinksRule } from "./empty-links";
import { duplicateIdsRule } from "./duplicate-ids";
import { ariaAttrsRule } from "./aria-attrs";
import { labelForRule } from "./label-for";
import type { AccessibilityRule } from "../../types";

/** All registered accessibility rules */
export const allRules: AccessibilityRule[] = [
  imgAltRule,
  formLabelsRule,
  headingOrderRule,
  documentLangRule,
  pageTitleRule,
  emptyLinksRule,
  duplicateIdsRule,
  ariaAttrsRule,
  labelForRule,
];
