import { NextRequest, NextResponse } from "next/server";
import { getGeminiExplanation } from "@/lib/gemini";
import type { Finding } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { finding } = body as { finding: Finding };

    if (!finding || !finding.ruleId || !finding.title) {
      return NextResponse.json(
        { error: "A valid finding is required." },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Gemini API is not configured. Add GEMINI_API_KEY to your .env.local file.",
          configured: false,
        },
        { status: 503 }
      );
    }

    const result = await getGeminiExplanation(finding);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to get explanation from Gemini. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini API route error:", error);
    return NextResponse.json(
      { error: "An error occurred while getting the AI explanation." },
      { status: 500 }
    );
  }
}
