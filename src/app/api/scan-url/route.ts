import { NextRequest, NextResponse } from "next/server";
import { validateUrl, validateRedirectUrl } from "@/lib/url-validator";
import { analyzeHtml } from "@/lib/scanner";

const MAX_RESPONSE_SIZE = 5_000_000; // 5MB
const REQUEST_TIMEOUT_MS = 15_000; // 15 seconds
const MAX_REDIRECTS = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required." },
        { status: 400 }
      );
    }

    // Validate URL for SSRF
    const validation = validateUrl(url);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Fetch the URL with timeout and size limits
    let html: string;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let currentUrl = url;
      let redirectCount = 0;
      let response: Response;

      // Manual redirect following with validation
      while (true) {
        response = await fetch(currentUrl, {
          signal: controller.signal,
          redirect: "manual",
          headers: {
            "User-Agent": "AccessAble-AI-Scanner/1.0 (Accessibility Auditor)",
            Accept: "text/html,application/xhtml+xml",
          },
        });

        // Handle redirects
        if (
          response.status >= 300 &&
          response.status < 400 &&
          response.headers.get("location")
        ) {
          redirectCount++;
          if (redirectCount > MAX_REDIRECTS) {
            clearTimeout(timeout);
            return NextResponse.json(
              { error: "Too many redirects." },
              { status: 400 }
            );
          }

          const redirectTarget = new URL(
            response.headers.get("location")!,
            currentUrl
          ).toString();

          // Validate redirect target
          const redirectValidation = validateRedirectUrl(redirectTarget, url);
          if (!redirectValidation.valid) {
            clearTimeout(timeout);
            return NextResponse.json(
              { error: redirectValidation.error },
              { status: 400 }
            );
          }

          currentUrl = redirectTarget;
          continue;
        }

        break;
      }

      clearTimeout(timeout);

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Failed to fetch the URL. Server responded with status ${response.status}.`,
          },
          { status: 400 }
        );
      }

      // Check content type
      const contentType = response.headers.get("content-type") || "";
      if (
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml") &&
        !contentType.includes("text/plain")
      ) {
        return NextResponse.json(
          {
            error: `The URL did not return HTML content (got ${contentType}). Only HTML pages can be analyzed.`,
          },
          { status: 400 }
        );
      }

      // Check content length
      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
        return NextResponse.json(
          { error: "The page is too large to analyze (max 5MB)." },
          { status: 400 }
        );
      }

      // Read body with size limit
      const reader = response.body?.getReader();
      if (!reader) {
        return NextResponse.json(
          { error: "Failed to read the response." },
          { status: 500 }
        );
      }

      const chunks: Uint8Array[] = [];
      let totalSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        totalSize += value.length;
        if (totalSize > MAX_RESPONSE_SIZE) {
          reader.cancel();
          return NextResponse.json(
            { error: "The page is too large to analyze (max 5MB)." },
            { status: 400 }
          );
        }

        chunks.push(value);
      }

      const decoder = new TextDecoder();
      html = chunks.map((chunk) => decoder.decode(chunk, { stream: true })).join("");
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out. The website took too long to respond." },
          { status: 408 }
        );
      }
      return NextResponse.json(
        {
          error:
            "Failed to fetch the URL. The website may be unavailable or blocking automated requests.",
        },
        { status: 400 }
      );
    }

    // Analyze the fetched HTML
    const result = analyzeHtml(html, "url", url);

    return NextResponse.json(result);
  } catch (error) {
    console.error("URL scan error:", error);
    return NextResponse.json(
      { error: "An error occurred while scanning the URL." },
      { status: 500 }
    );
  }
}
