"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /**
   * Enhanced Fetch Helper
   * Increased retries to 5 and delay to 3s to handle Render's "Cold Start" (up to 50s).
   */
  const fetchWithRetry = async (url: string, options: any, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        // Throw error if response is not 2xx to trigger catch/retry logic
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return await res.json();
      } catch (err) {
        if (i === retries - 1) throw err; // Final attempt failed
        // Wait 3 seconds before retrying
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  };

  const sendMessage = async () => {
    if (!input && !file) return;

    const question = input;
    // Update UI with user message immediately
    setMessages((prev) => [...prev, { role: "user", content: question || "Uploading file..." }]);
    setInput("");
    setLoading(true);

    try {
      /**
       * STEP 1: File Upload
       * Only proceeds if a file is selected.
       */
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        await fetchWithRetry(
          "https://ai-rag-doc-search.onrender.com",
          {
            method: "POST",
            body: formData,
            // Don't set Content-Type header manually for FormData; fetch handles it.
          }
        );
      }

      /**
       * STEP 2: Ask Question
       * Encodes the question into the URL query string to match the FastAPI @app.post("/ask") logic.
       */
      const data = await fetchWithRetry(
        `https://ai-rag-doc-search.onrender.com{encodeURIComponent(question)}`,
        { 
          method: "POST",
          headers: { "Accept": "application/json" }
        }
      );

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.answer || "I received an empty response." },
      ]);

      // Clear file only after full success
      setFile(null);

    } catch (err) {
      console.error("Connection failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "The server is waking up (Render cold start) or is currently offline. Please try again in 15 seconds.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navigation / Header */}
      <div className="p-4 bg-white border-b text-lg font-semibold shadow-sm">
        AI Document Chat
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-lg shadow-sm ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* AI Typing Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border px-4 py-2 rounded-2xl text-gray-400 animate-pulse">
              AI is processing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 border rounded-full px-4 py-2 shadow-sm focus-within:ring-2 ring-blue-300 transition-all">
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="text-xl text-gray-600">+</span>
          </button>

          {file && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 truncate max-w-[80px]">
              {file.name}
            </span>
          )}

          <input
            className="flex-1 outline-none px-2 bg-transparent text-gray-700"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading || (!input && !file)}
            className={`bg-black text-white px-5 py-1.5 rounded-full font-medium transition-all ${
              loading || (!input && !file) ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-800"
            }`}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
