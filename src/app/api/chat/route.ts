import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_INSTRUCTION = `You are AccessAble AI, an expert web accessibility (a11y) consultant and assistant.
Your goal is to help developers, designers, and site owners make web content accessible to everyone, including people with visual, auditory, motor, and cognitive disabilities.

Your expertise covers:
- WCAG 2.1 & 2.2 guidelines (Levels A, AA, AAA)
- Semantic HTML5, WAI-ARIA roles, states, and properties
- Keyboard navigation, focus management, and skip links
- Color contrast ratios, typography, and motion sensitivity
- Screen reader compatibility (NVDA, JAWS, VoiceOver, TalkBack)
- Accessible form design, error handling, and media alternatives (captions, alt text)

Tone & Style:
- Friendly, encouraging, and clear.
- Use beginner-friendly language without dumbing down technical accuracy.
- Provide clean, copy-pasteable HTML/CSS/React code snippets whenever helpful.
- Keep answers practical and concise. If explaining an issue, always provide both the "Why" and the "How to fix it".`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "A list of messages is required." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash"];

    // Exclude the latest message (which will be passed to sendMessage)
    const priorMessages = messages.slice(0, -1);

    // Find the first user message (ignore any initial greeting from the bot)
    const firstUserIndex = priorMessages.findIndex((m) => m.role === "user");

    const history: { role: "user" | "model"; parts: { text: string }[] }[] = [];

    if (firstUserIndex !== -1) {
      for (let i = firstUserIndex; i < priorMessages.length; i++) {
        const msg = priorMessages[i];
        const role = msg.role === "assistant" ? "model" : "user";

        // Merge consecutive messages with the same role to maintain alternating turns
        if (history.length > 0 && history[history.length - 1].role === role) {
          history[history.length - 1].parts[0].text += `\n\n${msg.content}`;
        } else {
          history.push({
            role,
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    const latestMessage = messages[messages.length - 1];

    let responseText: string | null = null;
    let lastError: unknown = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTION,
        });

        const chat = model.startChat({
          history,
        });

        const result = await chat.sendMessage(latestMessage.content);
        responseText = result.response.text();
        if (responseText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Chat model ${modelName} failed, trying next...`, err);
      }
    }

    if (!responseText) {
      throw lastError || new Error("No response received from any model.");
    }

    return NextResponse.json({
      reply: responseText,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: `Gemini API error: ${errMessage}` },
      { status: 500 }
    );
  }
}
