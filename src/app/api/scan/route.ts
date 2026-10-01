import { NextRequest, NextResponse } from "next/server";
import { analyzeHtml } from "@/lib/scanner";

const MAX_HTML_LENGTH = 2_000_000; // 2MB limit

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html } = body;

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "HTML content is required." },
        { status: 400 }
      );
    }

    if (html.length > MAX_HTML_LENGTH) {
      return NextResponse.json(
        {
          error: `HTML content is too large. Maximum size is ${MAX_HTML_LENGTH / 1_000_000}MB.`,
        },
        { status: 400 }
      );
    }

    const result = analyzeHtml(html, "html");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "An error occurred while analyzing the HTML." },
      { status: 500 }
    );
  }
}
