"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  Minimize2,
  Maximize2,
  ExternalLink,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "How do I fix missing alt text on images?",
  "What is the difference between WCAG A, AA, and AAA?",
  "How do I make custom buttons keyboard accessible?",
  "Check this: <button onclick=\"doSomething()\">Click</button>",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "👋 Hello! I'm **AccessAble AI**, your web accessibility & WCAG expert.\n\nAsk me how to solve accessibility issues, write accessible HTML/ARIA, or paste code snippets to audit them!",
    timestamp: new Date(),
  },
];

let messageIdCounter = 0;
function getNextId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Listen for custom trigger to open chatbot
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMessage: Message = {
      id: getNextId(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reach AI.");
      }

      const aiMessage: Message = {
        id: getNextId(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";

      const errorId = getNextId();
      setMessages((prev) => [
        ...prev,
        {
          id: errorId,
          role: "assistant",
          content: `⚠️ **Error:** ${errorMessage}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AccessAble AI Chatbot"
          aria-modal="false"
          className={`w-[calc(100vw-3rem)] sm:w-[420px] bg-[var(--navy-900)] border border-[var(--navy-700)] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col mb-4 ${
            isMinimized ? "h-14" : "h-[540px] max-h-[82vh]"
          }`}
          style={{
            boxShadow:
              "0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 20px rgba(20, 184, 166, 0.15)",
          }}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[var(--navy-900)] via-[var(--navy-800)] to-[var(--navy-900)] border-b border-[var(--navy-700)] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--teal-400)] to-[var(--teal-600)] flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white leading-none">
                    AccessAble AI
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(20,184,166,0.15)] text-[var(--teal-400)] font-medium border border-[rgba(20,184,166,0.3)]">
                    Gemini 2.0
                  </span>
                </div>
                <p className="text-[11px] text-[var(--gray-400)] leading-none mt-1">
                  Accessibility & WCAG Copilot
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Restart Chat"
                className="p-1.5 text-[var(--gray-400)] hover:text-white rounded-lg hover:bg-[var(--navy-700)] transition-colors"
                aria-label="Restart chat conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Maximize" : "Minimize"}
                className="p-1.5 text-[var(--gray-400)] hover:text-white rounded-lg hover:bg-[var(--navy-700)] transition-colors"
                aria-label={isMinimized ? "Maximize chat window" : "Minimize chat window"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 text-[var(--gray-400)] hover:text-white rounded-lg hover:bg-[var(--navy-700)] transition-colors"
                aria-label="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          {!isMinimized && (
            <>
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                aria-live="polite"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1 text-xs ${
                        msg.role === "user"
                          ? "bg-[var(--teal-500)] text-white"
                          : "bg-[var(--navy-700)] text-[var(--teal-400)]"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-[var(--teal-600)] to-[var(--teal-500)] text-white rounded-tr-none shadow-sm"
                          : "bg-[var(--navy-800)] text-[var(--gray-200)] border border-[var(--navy-700)] rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[var(--navy-700)] flex items-center justify-center text-[var(--teal-400)] mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-[var(--navy-800)] border border-[var(--navy-700)] rounded-xl rounded-tl-none p-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--teal-400)] animate-bounce" />
                      <span
                        className="w-2 h-2 rounded-full bg-[var(--teal-400)] animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-[var(--teal-400)] animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                      <span className="text-[11px] text-[var(--gray-400)] ml-1">
                        Analyzing...
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Prompts (only when conversation is short) */}
                {messages.length <= 2 && !loading && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-[var(--gray-400)] uppercase tracking-wider mb-2">
                      Suggested Questions
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {QUICK_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(prompt)}
                          className="text-left text-xs text-[var(--teal-300)] bg-[rgba(20,184,166,0.08)] hover:bg-[rgba(20,184,166,0.16)] border border-[rgba(20,184,166,0.2)] rounded-lg px-2.5 py-1.5 transition-colors flex items-center justify-between group"
                        >
                          <span className="truncate pr-2">{prompt}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-[var(--navy-950)] border-t border-[var(--navy-700)] flex items-center gap-2 flex-shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question or paste HTML..."
                  className="flex-1 bg-[var(--navy-800)] border border-[var(--navy-600)] focus:border-[var(--teal-400)] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[var(--gray-500)] outline-none transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl bg-[var(--teal-500)] hover:bg-[var(--teal-400)] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[var(--teal-500)] via-[var(--teal-600)] to-[var(--navy-700)] text-white shadow-xl hover:shadow-[0_8px_25px_rgba(20,184,166,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 border border-[rgba(255,255,255,0.15)]"
        aria-label={isOpen ? "Close AI Chatbot" : "Open AI Accessibility Chatbot"}
        aria-expanded={isOpen}
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--teal-300)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--teal-400)]"></span>
        </span>
        <Sparkles className="w-4 h-4 text-[var(--teal-200)] group-hover:rotate-12 transition-transform duration-300" />
        <span className="text-xs font-semibold tracking-wide">
          {isOpen ? "Close AI Chat" : "AI Assistant"}
        </span>
      </button>
    </div>
  );
}
