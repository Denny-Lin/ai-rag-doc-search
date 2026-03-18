"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom smoothly
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchWithRetry = async (url: string, options: any, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return await res.json();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  };

  const sendMessage = async () => {
    if (!input && !file) return;
    const question = input;
    // Removed Emoji
    setMessages((prev) => [...prev, { role: "user", content: question || "Uploading file..." }]);
    setInput("");
    setLoading(true);

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await fetchWithRetry("https://ai-rag-doc-search.onrender.com/upload", {
          method: "POST",
          body: formData,
        });
        // 🔥 REMOVED setFile(null) so the file stays selected
      }

      const data = await fetchWithRetry(
        `https://ai-rag-doc-search.onrender.com/ask?question=${encodeURIComponent(question)}`,
        { method: "POST", headers: { Accept: "application/json" } }
      );

      setMessages((prev) => [...prev, { role: "ai", content: data.answer || "No response received." }]);
    } catch (err) {
      console.error(err);
      // Removed Emoji
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Server is waking up. Please try again in 10 seconds." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans antialiased text-gray-900">
      {/* Header */}
      <header className="p-4 bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          AI Doc Insight
        </h1>
        <div className="text-xs text-gray-400 font-mono px-2 py-1 bg-gray-100 rounded">v1.0-RAG</div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`px-4 py-2.5 rounded-2xl max-w-[85%] md:max-w-lg shadow-sm text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Dynamic Loading Indicator */}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl rounded-bl-none flex gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input Section */}
      <footer className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 border-2 border-gray-100 rounded-2xl px-4 py-2 shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 bg-white">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
              title="Upload PDF"
            >
              <span className="text-xl text-gray-500 font-light">+</span>
            </button>

            <div className="flex-1 flex flex-col min-w-0">
              {file && (
                <div className="flex items-center gap-1.5 mb-1 animate-in zoom-in-95 duration-200">
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 font-medium truncate max-w-[120px]">
                    {file.name}
                  </span>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 text-xs">x</button>
                </div>
              )}
              <input
                className="w-full outline-none bg-transparent text-sm py-1"
                placeholder="Ask your document anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={loading || (!input && !file)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                loading || (!input && !file)
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95"
              }`}
            >
              {}
              <svg 
                xmlns="http://www.w3.org" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2">
            Powered by Groq & RAG Pipeline
          </p>
        </div>
      </footer>

    </div>
  );
}
