"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input) return;

    // add user message
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setLoading(true);

    try {
      // upload file if exists
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        await fetch("https://ai-rag-doc-search.onrender.com/upload", {
          method: "POST",
          body: formData,
        });

        setFile(null);
      }

      // ask question
      const res = await fetch(
        `https://ai-rag-doc-search.onrender.com/ask?question=${input}`,
        { method: "POST" }
      );

      const data = await res.json();

      // add AI message
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.answer || "No response" },
      ]);
    } catch (err) {
      // error fallback
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error occurred while fetching response." },
      ]);
    } finally {
      // 🔥 FIX: always stop loading
      setLoading(false);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* Header */}
      <div className="p-4 bg-white border-b text-lg font-semibold">
        AI Document Chat
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white border"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* 🔥 Loading bubble */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border px-4 py-2 rounded-lg text-gray-400">
              ...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 border rounded-full px-4 py-2 shadow-sm">

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-lg"
          >
            +
          </button>

          {/* File name */}
          {file && (
            <span className="text-xs text-gray-500 truncate max-w-[100px]">
              {file.name}
            </span>
          )}

          {/* Input */}
          <input
            className="flex-1 outline-none px-2"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          {/* Send */}
          <button
            onClick={sendMessage}
            className="bg-black text-white px-4 py-1 rounded-full"
          >
            ↑
          </button>

        </div>
      </div>
    </div>
  );
}