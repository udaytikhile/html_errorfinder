/**
 * URL validation with SSRF protection.
 * Blocks localhost, private IPs, reserved ranges, and cloud metadata endpoints.
 */

// Private and reserved IP ranges
const BLOCKED_IP_PATTERNS = [
  /^127\./,                    // Loopback
  /^10\./,                     // Private Class A
  /^172\.(1[6-9]|2\d|3[01])\./, // Private Class B
  /^192\.168\./,               // Private Class C
  /^169\.254\./,               // Link-local
  /^0\./,                      // Current network
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // Shared address space
  /^198\.18\./,                // Benchmark testing
  /^::1$/,                     // IPv6 loopback
  /^fc00:/i,                   // IPv6 unique local
  /^fe80:/i,                   // IPv6 link-local
  /^fd/i,                      // IPv6 private
];

// Blocked hostnames
const BLOCKED_HOSTNAMES = [
  "localhost",
  "localhost.localdomain",
  "0.0.0.0",
  "[::]",
  "[::1]",
  // Cloud metadata endpoints
  "metadata.google.internal",
  "metadata.google",
  "169.254.169.254",
];

// Allowed protocols
const ALLOWED_PROTOCOLS = ["http:", "https:"];

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  url?: URL;
}

/**
 * Validate a URL for safe server-side fetching.
 */
export function validateUrl(input: string): UrlValidationResult {
  // Basic validation
  if (!input || !input.trim()) {
    return { valid: false, error: "URL is required." };
  }

  const trimmed = input.trim();

  // Parse URL
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { valid: false, error: "Invalid URL format." };
  }

  // Check protocol
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    return {
      valid: false,
      error: `Protocol "${url.protocol}" is not allowed. Use http: or https:.`,
    };
  }

  // Check hostname
  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return {
      valid: false,
      error: "This hostname is not allowed for security reasons.",
    };
  }

  // Check for IP address patterns
  for (const pattern of BLOCKED_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return {
        valid: false,
        error: "Private and reserved IP addresses are not allowed.",
      };
    }
  }

  // Check for suspicious hostnames
  if (hostname.endsWith(".internal") || hostname.endsWith(".local")) {
    return {
      valid: false,
      error: "Internal and local hostnames are not allowed.",
    };
  }

  // Check for empty hostname
  if (!hostname) {
    return { valid: false, error: "URL must have a hostname." };
  }

  // Check URL length
  if (trimmed.length > 2048) {
    return { valid: false, error: "URL is too long (max 2048 characters)." };
  }

  return { valid: true, url };
}

/**
 * Validate a redirect target URL with the same SSRF protections.
 */
export function validateRedirectUrl(redirectUrl: string, originalUrl?: string): UrlValidationResult {
  const result = validateUrl(redirectUrl);
  if (!result.valid) {
    return {
      valid: false,
      error: `Redirect to blocked destination: ${result.error}`,
    };
  }

  // Prevent protocol downgrade from HTTPS to HTTP on redirect
  if (originalUrl && originalUrl.startsWith("https://") && redirectUrl.startsWith("http://")) {
    return {
      valid: false,
      error: "Redirect to insecure HTTP protocol is not allowed when original URL is HTTPS.",
    };
  }

  return result;
}
