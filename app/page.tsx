"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getSessionId, sendChatMessage, translations, type Language, type Message } from "@/assets/scripts/chat";
import { scrollToBottom } from "@/assets/scripts/utils";

const ChatInput = dynamic(() => import("@/components/ChatInput"), { ssr: false });
const ChatMessages = dynamic(() => import("@/components/ChatMessages"), { ssr: false });

export default function Home() {
  const [language, setLanguage] = useState<Language>("ru");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const t = translations[language];

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    setSessionId(getSessionId());
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    scrollToBottom(messagesEndRef.current);
  }, [messages]);

  useEffect(() => {
    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      inactivityTimerRef.current = setTimeout(() => {
        window.location.reload();
      }, 3 * 60 * 1000);
    };

    const handleActivity = () => {
      resetTimer();
    };

    resetTimer();

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('input', handleActivity);

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('input', handleActivity);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    
    lastActivityRef.current = Date.now();
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      window.location.reload();
    }, 3 * 60 * 1000);

    try {
      const data = await sendChatMessage(userMessage, language, sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.response || "",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: language === "ru" ? "Произошла ошибка. Попробуйте позже." : "Қате орын алды. Кейінірек көріңіз." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="police-gradient py-3 sm:py-4 px-3 sm:px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center gold-border flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                {t.title}
              </h1>
              <p className="text-yellow-400 text-xs sm:text-sm truncate">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="btn-police px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base whitespace-nowrap flex-shrink-0"
          >
            {t.login}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-5 flex flex-col">
        <div className="chat-container flex-1 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col min-h-[calc(100vh-180px)] sm:min-h-[500px]">
          <ChatMessages
            messages={messages}
            loading={loading}
            language={language}
            messagesEndRef={messagesEndRef}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            language={language}
            setLanguage={setLanguage}
            onSend={sendMessage}
            loading={loading}
            onKeyDown={handleKeyDown}
          />
        </div>
      </main>

      <footer className="py-4 text-center text-gray-400 text-sm">
        {t.footer}
      </footer>
    </div>
  );
}
