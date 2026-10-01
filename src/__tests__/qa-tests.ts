/**
 * Comprehensive QA Test Suite for AccessAble AI
 * Tests: Scanner rules, score calculation, URL validation, history, edge cases
 * Run with: npx tsx src/__tests__/qa-tests.ts
 */

import { analyzeHtml } from "../lib/scanner";
import { calculateScore, getScoreLabel } from "../lib/score";
import { validateUrl, validateRedirectUrl } from "../lib/url-validator";
import type { SeverityBreakdown } from "../lib/types";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    const msg = details ? `${testName}: ${details}` : testName;
    failures.push(msg);
    console.log(`  ❌ ${testName}${details ? ` — ${details}` : ""}`);
  }
}

function section(name: string) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${name}`);
  console.log(`${"═".repeat(60)}`);
}

// ══════════════════════════════════════════════════════════════
// 1. IMAGE ALT TEXT RULES
// ══════════════════════════════════════════════════════════════
section("1. IMAGE ALT TEXT RULES");

// Test 1.1: Image without alt
{
  const r = analyzeHtml('<img src="photo.jpg">', "html");
  const f = r.findings.filter(f => f.ruleId === "img-alt-missing");
  assert(f.length === 1, "1.1 Image without alt → critical finding", `found=${f.length}`);
  assert(f[0]?.severity === "critical", "1.1a Severity is critical");
}

// Test 1.2: Image with meaningful alt
{
  const r = analyzeHtml('<img src="photo.jpg" alt="A sunset over mountains">', "html");
  const f = r.findings.filter(f => f.ruleId.startsWith("img-alt"));
  assert(f.length === 0, "1.2 Image with meaningful alt → no finding", `found=${f.length}`);
}

// Test 1.3: Decorative image (role=presentation)
{
  const r = analyzeHtml('<img src="divider.png" role="presentation">', "html");
  const f = r.findings.filter(f => f.ruleId.startsWith("img-alt"));
  assert(f.length === 0, "1.3 Decorative image role=presentation → no finding", `found=${f.length}`);
}

// Test 1.4: Decorative image (role=none)
{
  const r = analyzeHtml('<img src="divider.png" role="none">', "html");
  const f = r.findings.filter(f => f.ruleId.startsWith("img-alt"));
  assert(f.length === 0, "1.4 Decorative image role=none → no finding", `found=${f.length}`);
}

// Test 1.5: Image with empty alt (no role)
{
  const r = analyzeHtml('<img src="photo.jpg" alt="">', "html");
  const f = r.findings.filter(f => f.ruleId === "img-alt-empty");
  assert(f.length === 1, "1.5 Image with empty alt (no role) → potential finding", `found=${f.length}`);
  assert(f[0]?.confidence === "potential", "1.5a Confidence is potential");
}

// Test 1.6: Multiple images mixed
{
  const r = analyzeHtml(`
    <img src="a.jpg">
    <img src="b.jpg" alt="B image">
    <img src="c.jpg" alt="">
    <img src="d.jpg" role="presentation">
  `, "html");
  const missing = r.findings.filter(f => f.ruleId === "img-alt-missing");
  const empty = r.findings.filter(f => f.ruleId === "img-alt-empty");
  assert(missing.length === 1, "1.6 Multiple images: 1 missing alt", `found=${missing.length}`);
  assert(empty.length === 1, "1.6a Multiple images: 1 empty alt", `found=${empty.length}`);
}

// ══════════════════════════════════════════════════════════════
// 2. EMPTY LINKS AND BUTTONS
// ══════════════════════════════════════════════════════════════
section("2. EMPTY LINKS AND BUTTONS");

// Test 2.1: Empty link
{
  const r = analyzeHtml('<a href="/about"></a>', "html");
  const f = r.findings.filter(f => f.ruleId === "link-empty");
  assert(f.length === 1, "2.1 Empty link → serious finding", `found=${f.length}`);
}

// Test 2.2: Link with text
{
  const r = analyzeHtml('<a href="/about">About us</a>', "html");
  const f = r.findings.filter(f => f.ruleId === "link-empty");
  assert(f.length === 0, "2.2 Link with text → no finding", `found=${f.length}`);
}

// Test 2.3: Link with aria-label
{
  const r = analyzeHtml('<a href="/about" aria-label="About page"></a>', "html");
  const f = r.findings.filter(f => f.ruleId === "link-empty");
  assert(f.length === 0, "2.3 Link with aria-label → no finding", `found=${f.length}`);
}

// Test 2.4: Link with image with alt
{
  const r = analyzeHtml('<a href="/"><img src="logo.png" alt="Home"></a>', "html");
  const f = r.findings.filter(f => f.ruleId === "link-empty");
  assert(f.length === 0, "2.4 Link with image alt → no finding", `found=${f.length}`);
}

// Test 2.5: Empty button
{
  const r = analyzeHtml('<button></button>', "html");
  const f = r.findings.filter(f => f.ruleId === "button-empty");
  assert(f.length === 1, "2.5 Empty button → serious finding", `found=${f.length}`);
}

// Test 2.6: Button with text
{
  const r = analyzeHtml('<button>Submit</button>', "html");
  const f = r.findings.filter(f => f.ruleId === "button-empty");
  assert(f.length === 0, "2.6 Button with text → no finding", `found=${f.length}`);
}

// Test 2.7: Button with aria-label
{
  const r = analyzeHtml('<button aria-label="Close dialog"></button>', "html");
  const f = r.findings.filter(f => f.ruleId === "button-empty");
  assert(f.length === 0, "2.7 Button with aria-label → no finding", `found=${f.length}`);
}

// Test 2.8: Link with title only
{
  const r = analyzeHtml('<a href="/about" title="About page"></a>', "html");
  const f = r.findings.filter(f => f.ruleId === "link-empty");
  assert(f.length === 0, "2.8 Link with title → no finding", `found=${f.length}`);
}

// ══════════════════════════════════════════════════════════════
// 3. FORM LABELS
// ══════════════════════════════════════════════════════════════
section("3. FORM LABELS");

// Test 3.1: Input without label
{
  const r = analyzeHtml('<input type="text" name="email">', "html");
  const f = r.findings.filter(f => f.ruleId === "form-label-missing");
  assert(f.length === 1, "3.1 Input without label → critical finding", `found=${f.length}`);
}

// Test 3.2: Input with associated label
{
  const r = analyzeHtml('<label for="email">Email</label><input type="text" id="email">', "html");
  const f = r.findings.filter(f => f.ruleId === "form-label-missing");
  assert(f.length === 0, "3.2 Input with label[for] → no finding", `found=${f.length}`);
}

// Test 3.3: Input with wrapping label
{
  const r = analyzeHtml('<label>Email <input type="text"></label>', "html");
  const f = r.findings.filter(f => f.ruleId === "form-label-missing");
  assert(f.length === 0, "3.3 Input inside label → no finding", `found=${f.length}`);
}

// Test 3.4: Input with aria-label
{
  const r = analyzeHtml('<input type="text" aria-label="Search">', "html");
  const f = r.findings.filter(f => f.ruleId === "form-label-missing");
  assert(f.length === 0, "3.4 Input with aria-label → no finding", `found=${f.length}`);
}

// Test 3.5: Hidden input is exempt
{
  const r = analyzeHtml('<input type="hidden" name="csrf_token">', "html");
  const f = r.findings.filter(f => f.ruleId === "form-label-missing");
  assert(f.length === 0, "3.5 Hidden input → no finding (exempt)", `found=${f.length}`);
}

// Test 3.6: Submit button is exempt
{
  const r = analyzeHtml('<input type="submit" value="Send">', "html");
  const f = r.findings.filter(f => f.ruleId === "form-label-missing");
  assert(f.length === 0, "3.6 Submit input → no finding (exempt)", `found=${f.length}`);
}

// Test 3.7: Select without label
{
  const r = analyzeHtml('<select name="country"><option>US</option></select>', "html");
  const f = r.findings.filter(f => f.ruleId === "form-label-missing");
  assert(f.length === 1, "3.7 Select without label → critical finding", `found=${f.length}`);
}

// Test 3.8: Textarea without label
{
  const r = analyzeHtml('<textarea name="bio"></textarea>', "html");
  const f = r.findings.filter(f => f.ruleId === "form-label-missing");
  assert(f.length === 1, "3.8 Textarea without label → critical finding", `found=${f.length}`);
}

// Test 3.9: Input with placeholder only (should still be accessible via fallback)
{
  const r = analyzeHtml('<input type="text" placeholder="Enter email">', "html");
  const f = r.findings.filter(f => f.ruleId === "form-label-missing");
  assert(f.length === 0, "3.9 Input with placeholder → no finding (fallback)", `found=${f.length}`);
}

// ══════════════════════════════════════════════════════════════
// 4. DOCUMENT LANGUAGE
// ══════════════════════════════════════════════════════════════
section("4. DOCUMENT LANGUAGE");

// Test 4.1: Missing lang on html
{
  const r = analyzeHtml('<html><head><title>Test</title></head><body><p>Hello</p></body></html>', "html");
  const f = r.findings.filter(f => f.ruleId === "document-lang-missing");
  assert(f.length === 1, "4.1 html without lang → serious finding", `found=${f.length}`);
}

// Test 4.2: Valid lang
{
  const r = analyzeHtml('<html lang="en"><head><title>Test</title></head><body><p>Hello</p></body></html>', "html");
  const f = r.findings.filter(f => f.ruleId.startsWith("document-lang"));
  assert(f.length === 0, "4.2 html with lang='en' → no finding", `found=${f.length}`);
}

// Test 4.3: Empty lang
{
  const r = analyzeHtml('<html lang=""><head><title>Test</title></head><body></body></html>', "html");
  const f = r.findings.filter(f => f.ruleId === "document-lang-empty");
  assert(f.length === 1, "4.3 html with lang='' → serious finding", `found=${f.length}`);
}

// Test 4.4: Small snippet (no html element)
{
  const r = analyzeHtml('<p>Hello</p>', "html");
  const f = r.findings.filter(f => f.ruleId === "document-lang-missing");
  assert(f.length === 0, "4.4 Small snippet without html → no finding (too small)", `found=${f.length}`);
}

// ══════════════════════════════════════════════════════════════
// 5. PAGE TITLE
// ══════════════════════════════════════════════════════════════
section("5. PAGE TITLE");

// Test 5.1: Missing title
{
  const r = analyzeHtml('<html lang="en"><head></head><body></body></html>', "html");
  const f = r.findings.filter(f => f.ruleId === "page-title-missing");
  assert(f.length === 1, "5.1 Missing title → serious finding", `found=${f.length}`);
}

// Test 5.2: Empty title
{
  const r = analyzeHtml('<html lang="en"><head><title></title></head><body></body></html>', "html");
  const f = r.findings.filter(f => f.ruleId === "page-title-empty");
  assert(f.length === 1, "5.2 Empty title → serious finding", `found=${f.length}`);
}

// Test 5.3: Valid title
{
  const r = analyzeHtml('<html lang="en"><head><title>My Page</title></head><body></body></html>', "html");
  const f = r.findings.filter(f => f.ruleId.startsWith("page-title"));
  assert(f.length === 0, "5.3 Valid title → no finding", `found=${f.length}`);
}

// ══════════════════════════════════════════════════════════════
// 6. DUPLICATE IDS
// ══════════════════════════════════════════════════════════════
section("6. DUPLICATE IDS");

// Test 6.1: Duplicate ids
{
  const r = analyzeHtml('<div id="main">A</div><div id="main">B</div>', "html");
  const f = r.findings.filter(f => f.ruleId === "duplicate-id");
  assert(f.length === 1, "6.1 Duplicate id → serious finding", `found=${f.length}`);
  assert(f[0]?.title.includes('"main"'), "6.1a Finding mentions the duplicate id");
}

// Test 6.2: Unique ids
{
  const r = analyzeHtml('<div id="a">A</div><div id="b">B</div>', "html");
  const f = r.findings.filter(f => f.ruleId === "duplicate-id");
  assert(f.length === 0, "6.2 Unique ids → no finding", `found=${f.length}`);
}

// Test 6.3: Triple duplicate
{
  const r = analyzeHtml('<div id="x"></div><span id="x"></span><p id="x"></p>', "html");
  const f = r.findings.filter(f => f.ruleId === "duplicate-id");
  assert(f.length === 1, "6.3 Triple duplicate → 1 finding", `found=${f.length}`);
  assert(f[0]?.title.includes("3 times"), "6.3a Mentions count of 3");
}

// ══════════════════════════════════════════════════════════════
// 7. LABEL FOR REFERENCES
// ══════════════════════════════════════════════════════════════
section("7. LABEL FOR REFERENCES");

// Test 7.1: Label referencing nonexistent control
{
  const r = analyzeHtml('<label for="name">Name</label>', "html");
  const f = r.findings.filter(f => f.ruleId === "label-for-nonexistent");
  assert(f.length === 1, "7.1 Label for nonexistent id → serious finding", `found=${f.length}`);
}

// Test 7.2: Label referencing existing control
{
  const r = analyzeHtml('<label for="name">Name</label><input id="name">', "html");
  const f = r.findings.filter(f => f.ruleId === "label-for-nonexistent");
  assert(f.length === 0, "7.2 Label for existing id → no finding", `found=${f.length}`);
}

// ══════════════════════════════════════════════════════════════
// 8. HEADING HIERARCHY
// ══════════════════════════════════════════════════════════════
section("8. HEADING HIERARCHY");

// Test 8.1: Skipped heading level
{
  const r = analyzeHtml('<h1>Title</h1><h3>Subtitle</h3>', "html");
  const f = r.findings.filter(f => f.ruleId === "heading-skip-level");
  assert(f.length === 1, "8.1 h1→h3 skip → moderate finding", `found=${f.length}`);
}

// Test 8.2: Valid heading order
{
  const r = analyzeHtml('<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>', "html");
  const f = r.findings.filter(f => f.ruleId === "heading-skip-level");
  assert(f.length === 0, "8.2 h1→h2→h3 valid → no finding", `found=${f.length}`);
}

// Test 8.3: First heading not h1
{
  const r = analyzeHtml('<h2>Subtitle</h2>', "html");
  const f = r.findings.filter(f => f.ruleId === "heading-first-not-h1");
  assert(f.length === 1, "8.3 First heading is h2 → moderate finding", `found=${f.length}`);
}

// Test 8.4: Empty heading
{
  const r = analyzeHtml('<h1></h1>', "html");
  const f = r.findings.filter(f => f.ruleId === "heading-empty");
  assert(f.length === 1, "8.4 Empty h1 → serious finding", `found=${f.length}`);
}

// ══════════════════════════════════════════════════════════════
// 9. ARIA ATTRIBUTES
// ══════════════════════════════════════════════════════════════
section("9. ARIA ATTRIBUTES");

// Test 9.1: Invalid ARIA role
{
  const r = analyzeHtml('<div role="foobar">Content</div>', "html");
  const f = r.findings.filter(f => f.ruleId === "aria-invalid-role");
  assert(f.length === 1, "9.1 Invalid role 'foobar' → serious finding", `found=${f.length}`);
}

// Test 9.2: Valid ARIA role
{
  const r = analyzeHtml('<div role="navigation">Nav</div>', "html");
  const f = r.findings.filter(f => f.ruleId === "aria-invalid-role");
  assert(f.length === 0, "9.2 Valid role 'navigation' → no finding", `found=${f.length}`);
}

// Test 9.3: Broken aria-labelledby reference
{
  const r = analyzeHtml('<div aria-labelledby="nonexistent">Content</div>', "html");
  const f = r.findings.filter(f => f.ruleId === "aria-broken-reference");
  assert(f.length === 1, "9.3 Broken aria-labelledby → serious finding", `found=${f.length}`);
}

// Test 9.4: Valid aria-labelledby reference
{
  const r = analyzeHtml('<span id="lbl">Label</span><div aria-labelledby="lbl">Content</div>', "html");
  const f = r.findings.filter(f => f.ruleId === "aria-broken-reference");
  assert(f.length === 0, "9.4 Valid aria-labelledby → no finding", `found=${f.length}`);
}

// ══════════════════════════════════════════════════════════════
// 10. VALID ACCESSIBLE HTML (FALSE POSITIVE TEST)
// ══════════════════════════════════════════════════════════════
section("10. VALID ACCESSIBLE HTML (FALSE POSITIVE TEST)");

{
  const validHtml = `<!DOCTYPE html>
<html lang="en">
<head><title>Accessible Page</title></head>
<body>
  <h1>Welcome</h1>
  <h2>About</h2>
  <p>Some content</p>
  <img src="hero.jpg" alt="A beautiful landscape">
  <img src="spacer.gif" alt="" role="presentation">
  <a href="/about">About Us</a>
  <button>Submit</button>
  <label for="email">Email</label>
  <input type="email" id="email">
  <nav role="navigation" aria-label="Main">
    <a href="/">Home</a>
  </nav>
</body>
</html>`;
  const r = analyzeHtml(validHtml, "html");
  assert(
    r.findings.length === 0,
    "10.1 Fully accessible HTML → zero findings",
    `found=${r.findings.length}: ${r.findings.map(f => f.ruleId).join(", ")}`
  );
  assert(r.score === 100, "10.2 Perfect score for accessible HTML", `score=${r.score}`);
}

// ══════════════════════════════════════════════════════════════
// 11. SCORE CALCULATION
// ══════════════════════════════════════════════════════════════
section("11. SCORE CALCULATION");

{
  const bd0: SeverityBreakdown = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  assert(calculateScore(bd0) === 100, "11.1 Zero issues → score 100");

  const bd1: SeverityBreakdown = { critical: 1, serious: 0, moderate: 0, minor: 0 };
  assert(calculateScore(bd1) === 85, "11.2 1 critical → score 85", `got ${calculateScore(bd1)}`);

  const bd2: SeverityBreakdown = { critical: 0, serious: 1, moderate: 0, minor: 0 };
  assert(calculateScore(bd2) === 92, "11.3 1 serious → score 92", `got ${calculateScore(bd2)}`);

  const bd3: SeverityBreakdown = { critical: 0, serious: 0, moderate: 1, minor: 0 };
  assert(calculateScore(bd3) === 97, "11.4 1 moderate → score 97", `got ${calculateScore(bd3)}`);

  const bd4: SeverityBreakdown = { critical: 0, serious: 0, moderate: 0, minor: 1 };
  assert(calculateScore(bd4) === 99, "11.5 1 minor → score 99", `got ${calculateScore(bd4)}`);

  const bdMax: SeverityBreakdown = { critical: 10, serious: 10, moderate: 10, minor: 10 };
  assert(calculateScore(bdMax) === 0, "11.6 Many issues → score floors at 0", `got ${calculateScore(bdMax)}`);

  assert(getScoreLabel(100) === "Excellent", "11.7 Score 100 label");
  assert(getScoreLabel(75) === "Good", "11.8 Score 75 label");
  assert(getScoreLabel(50) === "Needs Improvement", "11.9 Score 50 label");
  assert(getScoreLabel(30) === "Poor", "11.10 Score 30 label");
  assert(getScoreLabel(10) === "Critical Issues", "11.11 Score 10 label");
}

// ══════════════════════════════════════════════════════════════
// 12. URL VALIDATION (SSRF PROTECTION)
// ══════════════════════════════════════════════════════════════
section("12. URL VALIDATION (SSRF PROTECTION)");

// Valid URLs
assert(validateUrl("https://example.com").valid, "12.1 https://example.com → valid");
assert(validateUrl("http://example.com").valid, "12.2 http://example.com → valid");
assert(validateUrl("https://www.google.com/search?q=a11y").valid, "12.3 URL with query → valid");

// Invalid/blocked URLs
assert(!validateUrl("").valid, "12.4 Empty string → invalid");
assert(!validateUrl("not-a-url").valid, "12.5 Not a URL → invalid");
assert(!validateUrl("file:///etc/passwd").valid, "12.6 file: protocol → blocked");
assert(!validateUrl("ftp://example.com").valid, "12.7 ftp: protocol → blocked");
assert(!validateUrl("javascript:alert(1)").valid, "12.8 javascript: protocol → blocked");

// Localhost/private
assert(!validateUrl("http://localhost").valid, "12.9 localhost → blocked");
assert(!validateUrl("http://localhost:3000").valid, "12.10 localhost:3000 → blocked");
assert(!validateUrl("http://127.0.0.1").valid, "12.11 127.0.0.1 → blocked");
assert(!validateUrl("http://0.0.0.0").valid, "12.12 0.0.0.0 → blocked");

// Private IP ranges
assert(!validateUrl("http://10.0.0.1").valid, "12.13 10.x → blocked");
assert(!validateUrl("http://172.16.0.1").valid, "12.14 172.16.x → blocked");
assert(!validateUrl("http://192.168.1.1").valid, "12.15 192.168.x → blocked");
assert(!validateUrl("http://169.254.169.254").valid, "12.16 Link-local → blocked");

// Cloud metadata
assert(!validateUrl("http://169.254.169.254/latest/meta-data").valid, "12.17 AWS metadata → blocked");
assert(!validateUrl("http://metadata.google.internal").valid, "12.18 GCP metadata → blocked");

// IPv6
assert(!validateUrl("http://[::1]").valid, "12.19 IPv6 loopback → blocked");

// Internal hostnames
assert(!validateUrl("http://server.internal").valid, "12.20 .internal hostname → blocked");
assert(!validateUrl("http://app.local").valid, "12.21 .local hostname → blocked");

// Long URL
assert(!validateUrl("https://example.com/" + "a".repeat(2100)).valid, "12.22 Extremely long URL → blocked");

// Redirect validation
assert(!validateRedirectUrl("http://127.0.0.1", "https://example.com").valid, "12.23 Redirect to localhost → blocked");
assert(validateRedirectUrl("https://example.org", "https://example.com").valid, "12.24 Redirect to public URL → valid");

// ══════════════════════════════════════════════════════════════
// 13. EDGE CASES
// ══════════════════════════════════════════════════════════════
section("13. EDGE CASES");

// Test 13.1: Empty input
{
  const r = analyzeHtml("", "html");
  assert(r !== null && r !== undefined, "13.1 Empty string doesn't crash");
  assert(r.findings.length >= 0, "13.1a Returns valid findings array");
  assert(r.score >= 0 && r.score <= 100, "13.1b Score in range", `score=${r.score}`);
}

// Test 13.2: Malformed HTML
{
  const r = analyzeHtml('<div><p>unclosed <span>tags', "html");
  assert(r !== null, "13.2 Malformed HTML doesn't crash");
  assert(typeof r.score === "number", "13.2a Returns numeric score");
}

// Test 13.3: HTML with scripts (should not execute)
{
  const r = analyzeHtml('<html><script>alert("xss")</script><body></body></html>', "html");
  assert(r !== null, "13.3 HTML with scripts doesn't crash");
  // Script should NOT execute — htmlparser2 doesn't execute JS
}

// Test 13.4: HTML with event handlers
{
  const r = analyzeHtml('<button onclick="alert(1)">Click</button>', "html");
  assert(r !== null, "13.4 HTML with event handlers doesn't crash");
}

// Test 13.5: Unicode content
{
  const r = analyzeHtml('<html lang="ja"><head><title>テスト</title></head><body><h1>こんにちは世界</h1></body></html>', "html");
  assert(r !== null, "13.5 Unicode/Japanese content doesn't crash");
  assert(r.score >= 0, "13.5a Returns valid score");
}

// Test 13.6: Emoji content
{
  const r = analyzeHtml('<h1>🎉 Welcome! 🚀</h1><p>Testing emoji 💻</p>', "html");
  assert(r !== null, "13.6 Emoji content doesn't crash");
}

// Test 13.7: Large HTML
{
  let bigHtml = '<html lang="en"><head><title>Big</title></head><body>';
  for (let i = 0; i < 1000; i++) {
    bigHtml += `<div id="el-${i}"><p>Paragraph ${i}</p></div>`;
  }
  bigHtml += '</body></html>';
  const start = Date.now();
  const r = analyzeHtml(bigHtml, "html");
  const elapsed = Date.now() - start;
  assert(r !== null, "13.7 Large HTML (1000 divs) doesn't crash");
  assert(elapsed < 10000, "13.7a Completes within 10s", `took ${elapsed}ms`);
}

// Test 13.8: Missing closing tags
{
  const r = analyzeHtml('<html lang="en"><head><title>Test</title><body><div><p>No closing', "html");
  assert(r !== null, "13.8 Missing closing tags doesn't crash");
}

// Test 13.9: Empty attributes
{
  const r = analyzeHtml('<img src="" alt=""><a href=""></a>', "html");
  assert(r !== null, "13.9 Empty attributes don't crash");
}

// Test 13.10: Nested forms
{
  const r = analyzeHtml('<form><input type="text" aria-label="A"><form><input type="text" aria-label="B"></form></form>', "html");
  assert(r !== null, "13.10 Nested forms don't crash");
}

// Test 13.11: Large number of findings
{
  let html = '';
  for (let i = 0; i < 50; i++) {
    html += `<img src="img${i}.jpg">`;
  }
  const r = analyzeHtml(html, "html");
  assert(r.findings.length >= 50, "13.11 50 images without alt → 50+ findings", `found=${r.findings.length}`);
  assert(r.score === 0, "13.11a Score floors at 0 with many issues", `score=${r.score}`);
}

// ══════════════════════════════════════════════════════════════
// 14. SCAN RESULT STRUCTURE
// ══════════════════════════════════════════════════════════════
section("14. SCAN RESULT STRUCTURE");

{
  const r = analyzeHtml('<html lang="en"><head><title>Test</title></head><body><img src="x.jpg"></body></html>', "html");
  assert(typeof r.id === "string" && r.id.length > 0, "14.1 ScanResult has id");
  assert(typeof r.timestamp === "string" && r.timestamp.length > 0, "14.2 Has timestamp");
  assert(r.source === "html", "14.3 Source is 'html'");
  assert(typeof r.htmlSnippet === "string", "14.4 Has htmlSnippet");
  assert(Array.isArray(r.findings), "14.5 Findings is array");
  assert(typeof r.severityBreakdown === "object", "14.6 Has severityBreakdown");
  assert(typeof r.score === "number", "14.7 Score is number");
  assert(r.score >= 0 && r.score <= 100, "14.8 Score in [0,100]", `score=${r.score}`);
  assert(typeof r.elementsAnalyzed === "number" && r.elementsAnalyzed > 0, "14.9 elementsAnalyzed > 0");
  assert(typeof r.rulesChecked === "number" && r.rulesChecked > 0, "14.10 rulesChecked > 0");

  // Severity breakdown should match findings
  const critCount = r.findings.filter(f => f.severity === "critical").length;
  const seriousCount = r.findings.filter(f => f.severity === "serious").length;
  const moderateCount = r.findings.filter(f => f.severity === "moderate").length;
  const minorCount = r.findings.filter(f => f.severity === "minor").length;
  assert(r.severityBreakdown.critical === critCount, "14.11 Critical count matches", `${r.severityBreakdown.critical} vs ${critCount}`);
  assert(r.severityBreakdown.serious === seriousCount, "14.12 Serious count matches");
  assert(r.severityBreakdown.moderate === moderateCount, "14.13 Moderate count matches");
  assert(r.severityBreakdown.minor === minorCount, "14.14 Minor count matches");
}

// ══════════════════════════════════════════════════════════════
// 15. FINDING STRUCTURE
// ══════════════════════════════════════════════════════════════
section("15. FINDING STRUCTURE");

{
  const r = analyzeHtml('<img src="test.jpg">', "html");
  const f = r.findings[0];
  assert(typeof f.ruleId === "string" && f.ruleId.length > 0, "15.1 Finding has ruleId");
  assert(typeof f.title === "string" && f.title.length > 0, "15.2 Finding has title");
  assert(["critical", "serious", "moderate", "minor"].includes(f.severity), "15.3 Valid severity");
  assert(["confirmed", "potential"].includes(f.confidence), "15.4 Valid confidence");
  assert(typeof f.explanation === "string" && f.explanation.length > 0, "15.5 Has explanation");
  assert(typeof f.element === "string" && f.element.length > 0, "15.6 Has element");
  assert(typeof f.fix === "string" && f.fix.length > 0, "15.7 Has fix");
}

// ══════════════════════════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════════════════════════
console.log(`\n${"═".repeat(60)}`);
console.log(`  TEST RESULTS`);
console.log(`${"═".repeat(60)}`);
console.log(`  Total:  ${passed + failed}`);
console.log(`  Passed: ${passed} ✅`);
console.log(`  Failed: ${failed} ❌`);
if (failures.length > 0) {
  console.log(`\n  FAILURES:`);
  for (const f of failures) {
    console.log(`    ❌ ${f}`);
  }
}
console.log(`${"═".repeat(60)}\n`);

process.exit(failed > 0 ? 1 : 0);
